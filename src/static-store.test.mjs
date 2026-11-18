import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { staticRequest } from "./static-store.ts";
let values;
beforeEach(() => {
  values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };
});
const post = (body, method = "POST") => ({
  method,
  body: JSON.stringify(body),
});
const q = (type = "short-text", extra = {}) => ({
  id: crypto.randomUUID(),
  type,
  title: "A question",
  description: "",
  required: true,
  options: [],
  ...extra,
});
test("static demo seeds once, persists lifecycle and response snapshots", async () => {
  const initial = await staticRequest("/forms");
  assert.equal(initial.length, 6);
  assert.equal(
    initial.reduce((n, f) => n + f.responseCount, 0),
    0,
  );
  const question = q();
  const created = await staticRequest(
    "/forms",
    post({ title: "Test form", questions: [question] }),
  );
  await assert.rejects(
    staticRequest("/public/forms/" + created.id),
    /available/,
  );
  const published = await staticRequest(
    "/forms/" + created.id,
    post({ status: "published" }, "PUT"),
  );
  await assert.rejects(
    staticRequest(
      "/public/forms/" + created.id + "/responses",
      post({ answers: {} }),
    ),
    /required/,
  );
  await staticRequest(
    "/public/forms/" + created.id + "/responses",
    post({ answers: { [question.id]: "A real answer" } }),
  );
  const responses = await staticRequest("/forms/" + created.id + "/responses");
  assert.equal(responses[0].questions[0].title, "A question");
  await staticRequest(
    "/forms/" + created.id,
    post({ questions: [{ ...question, title: "Changed title" }] }, "PUT"),
  );
  assert.equal(
    (await staticRequest("/forms/" + created.id + "/responses"))[0].questions[0]
      .title,
    "A question",
  );
  assert.equal((await staticRequest("/forms/" + created.id)).responseCount, 1);
  const duplicate = await staticRequest(
    "/forms/" + created.id + "/duplicate",
    post({}),
  );
  assert.equal(duplicate.status, "draft");
  assert.equal(duplicate.responseCount, 0);
  assert.notEqual(duplicate.questions[0].id, question.id);
  await staticRequest("/forms/" + created.id, post({ trashed: true }, "PUT"));
  await assert.rejects(
    staticRequest("/public/forms/" + created.id),
    /available/,
  );
  await staticRequest("/forms/" + created.id, post({ trashed: false }, "PUT"));
  assert.equal(
    (await staticRequest("/public/forms/" + created.id)).status,
    "published",
  );
  await staticRequest("/forms/" + created.id, { method: "DELETE" });
  assert.equal((await staticRequest("/forms")).length, 7);
  await assert.rejects(
    staticRequest("/forms/" + created.id + "/responses"),
    /not found/,
  );
  assert.equal(published.title, "Test form");
});
test("shared snapshot works in a separate browser without exposing other forms", async () => {
  const created = await staticRequest(
    "/forms",
    post({ title: "A shared form", questions: [q()], status: "published" }),
  );
  values.clear();
  const received = await staticRequest(
    "/public/forms/" + created.id,
    {},
    created,
  );
  assert.equal(received.title, "A shared form");
  const response = await staticRequest(
    "/public/forms/" + created.id + "/responses",
    post({ answers: { [created.questions[0].id]: "Hello" } }),
    created,
  );
  assert.equal(response.formId, created.id);
  await assert.rejects(staticRequest("/forms/" + created.id), /not found/);
  await assert.rejects(
    staticRequest(
      "/public/forms/" + created.id,
      {},
      { ...created, id: "wrong" },
    ),
    /available/,
  );
  await assert.rejects(
    staticRequest(
      "/public/forms/" + created.id,
      {},
      { ...created, status: "draft" },
    ),
    /available/,
  );
});
test("static demo validates answer types and unsafe identifiers", async () => {
  const questions = [
    q("email"),
    q("number"),
    q("rating"),
    q("yes-no"),
    q("multiple-choice", { options: ["One", "Two"] }),
  ];
  const form = await staticRequest(
    "/forms",
    post({ title: "Validated form", questions, status: "published" }),
  );
  const answers = Object.fromEntries(
    questions.map((question, i) => [
      question.id,
      ["valid@example.com", 42, 5, "Yes", "One"][i],
    ]),
  );
  for (let i = 0; i < questions.length; i++)
    await assert.rejects(
      staticRequest(
        "/public/forms/" + form.id + "/responses",
        post({
          answers: {
            ...answers,
            [questions[i].id]: ["bad", {}, 8, "Maybe", "Three"][i],
          },
        }),
      ),
    );
  await assert.rejects(
    staticRequest(
      "/public/forms/" + form.id + "/responses",
      post({ answers: { ...answers, unknown: "no" } }),
    ),
    /unknown/,
  );
  assert.equal(
    (
      await staticRequest(
        "/public/forms/" + form.id + "/responses",
        post({ answers }),
      )
    ).answers[questions[1].id],
    42,
  );
  await assert.rejects(
    staticRequest(
      "/forms",
      post({ questions: [q("short-text", { id: "__proto__" })] }),
    ),
    /valid/,
  );
});
test("storage failures never report successful writes", async () => {
  await staticRequest("/forms");
  localStorage.setItem = () => {
    throw new Error("quota");
  };
  await assert.rejects(
    staticRequest("/forms", post({ title: "Cannot save" })),
    /weren’t saved/,
  );
});
