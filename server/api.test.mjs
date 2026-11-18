import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import { createApp } from "./app.mjs";
import { openDatabase } from "./db.mjs";

async function fixture(
  t,
  { seed = false, file = ":memory:", staticDirectory } = {},
) {
  const db = openDatabase(file, { seed });
  const server = createApp(db, { staticDirectory }).listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  });
  const request = async (path, method = "GET", body) => {
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api${path}`,
      {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      },
    );
    return {
      status: response.status,
      body: response.status === 204 ? null : await response.json(),
    };
  };
  return { db, request, server };
}
const q = (id, type, required = true, options = []) => ({
  id,
  type,
  title: `Question ${id}`,
  description: "",
  required,
  options,
});

test("full form lifecycle persists responses, duplicates independently, trashes, restores and deletes", async (t) => {
  const { request } = await fixture(t);
  const created = await request("/forms", "POST", {
    title: "A real survey",
    questions: [q("name", "short-text"), q("email", "email")],
  });
  assert.equal(created.status, 201);
  const id = created.body.id;
  assert.equal(created.body.responseCount, 0);
  assert.equal((await request(`/public/forms/${id}`)).status, 404);
  assert.equal(
    (
      await request(`/public/forms/${id}/responses`, "POST", {
        answers: { name: "Alex", email: "alex@example.com" },
      })
    ).status,
    404,
  );
  assert.equal(
    (await request(`/forms/${id}`, "PUT", { status: "published" })).body.status,
    "published",
  );
  assert.equal((await request(`/public/forms/${id}`)).status, 200);
  const submitted = await request(`/public/forms/${id}/responses`, "POST", {
    answers: { name: "Alex", email: "alex@example.com" },
  });
  assert.equal(submitted.status, 201);
  assert.equal(submitted.body.formId, id);
  assert.equal((await request("/forms")).body[0].responseCount, 1);
  const responses = (await request(`/forms/${id}/responses`)).body;
  assert.equal(responses.length, 1);
  assert.deepEqual(responses[0].answers, {
    name: "Alex",
    email: "alex@example.com",
  });
  const copy = await request(`/forms/${id}/duplicate`, "POST");
  assert.equal(copy.status, 201);
  assert.equal(copy.body.title, "A real survey (copy)");
  assert.equal(copy.body.status, "draft");
  assert.equal(copy.body.responseCount, 0);
  assert.notEqual(copy.body.questions[0].id, "name");
  await request(`/forms/${id}`, "PUT", { trashed: true });
  assert.equal((await request(`/public/forms/${id}`)).status, 404);
  assert.equal(
    (await request("/forms")).body.find((f) => f.id === id).trashed,
    true,
  );
  await request(`/forms/${id}`, "PUT", { trashed: false });
  assert.equal((await request(`/public/forms/${id}`)).status, 200);
  assert.equal((await request(`/forms/${id}`, "DELETE")).status, 204);
  assert.equal((await request(`/forms/${id}`)).status, 404);
  assert.equal((await request(`/forms/${id}/responses`)).status, 404);
});

test("validates all answer types and refuses unknown questions or structured values", async (t) => {
  const { request, db } = await fixture(t);
  const form = (
    await request("/forms", "POST", {
      title: "Validation",
      status: "published",
      questions: [
        q("email", "email"),
        q("choice", "multiple-choice", true, ["A", "B"]),
        q("rating", "rating"),
        q("number", "number"),
        q("boolean", "yes-no"),
        q("optional", "long-text", false),
      ],
    })
  ).body;
  const valid = {
    email: "a@b.com",
    choice: "A",
    rating: 4,
    number: "2.5",
    boolean: "Yes",
  };
  const invalid = [
    { ...valid, email: "" },
    { ...valid, email: "not-an-email" },
    { ...valid, choice: "C" },
    { ...valid, rating: 6 },
    { ...valid, rating: 2.5 },
    { ...valid, number: "NaN" },
    { ...valid, boolean: "true" },
    { ...valid, unknown: "bad" },
    { ...valid, email: { nested: "bad" } },
  ];
  for (const answers of invalid)
    assert.equal(
      (await request(`/public/forms/${form.id}/responses`, "POST", { answers }))
        .status,
      400,
    );
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM responses").get().n, 0);
  const submitted = await request(
    `/public/forms/${form.id}/responses`,
    "POST",
    { answers: valid },
  );
  assert.equal(submitted.status, 201);
  assert.equal(submitted.body.answers.number, 2.5);
  assert.equal(Object.hasOwn(submitted.body.answers, "optional"), false);
});

test("submission question snapshots survive question edits and deletion", async (t) => {
  const { request } = await fixture(t);
  const originalQuestions = [q("name", "short-text"), q("email", "email")];
  const form = (
    await request("/forms", "POST", {
      title: "History",
      status: "published",
      questions: originalQuestions,
    })
  ).body;
  const submission = await request(
    `/public/forms/${form.id}/responses`,
    "POST",
    { answers: { name: "Alex", email: "alex@example.com" } },
  );
  assert.deepEqual(submission.body.questions, originalQuestions);
  const edited = await request(`/forms/${form.id}`, "PUT", {
    questions: [
      { ...q("email", "long-text"), title: "A completely different question" },
    ],
  });
  assert.equal(edited.status, 200);
  const responses = (await request(`/forms/${form.id}/responses`)).body;
  assert.deepEqual(responses[0].questions, originalQuestions);
  assert.deepEqual(responses[0].answers, {
    name: "Alex",
    email: "alex@example.com",
  });
});

test("legacy response tables migrate without losing existing answers", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "openform-migrate-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const file = join(directory, "database.sqlite");
  let db = openDatabase(file);
  const formId = db.prepare("SELECT id FROM forms LIMIT 1").get().id;
  db.exec("ALTER TABLE responses DROP COLUMN questions");
  db.prepare(
    "INSERT INTO responses (id,formId,answers,createdAt) VALUES (?,?,?,?)",
  ).run(
    "old-response",
    formId,
    JSON.stringify({ old: "preserved" }),
    new Date().toISOString(),
  );
  db.close();
  db = openDatabase(file);
  assert.equal(
    db
      .prepare("PRAGMA table_info(responses)")
      .all()
      .filter((c) => c.name === "questions").length,
    1,
  );
  assert.equal(
    db.prepare("SELECT answers FROM responses WHERE id=?").get("old-response")
      .answers,
    '{"old":"preserved"}',
  );
  db.close();
  const { request } = await fixture(t, { file });
  const form = (await request(`/forms/${formId}`)).body;
  const response = (await request(`/forms/${formId}/responses`)).body[0];
  assert.deepEqual(response.questions, form.questions);
  assert.deepEqual(response.answers, { old: "preserved" });
});

test("rejects malformed forms and unsafe question IDs, allows incomplete drafts", async (t) => {
  const { request } = await fixture(t);
  for (const form of [
    null,
    [],
    { theme: "bad" },
    { status: "bad" },
    { title: 1 },
    { questions: [q("__proto__", "short-text")] },
    { questions: [q("x", "short-text"), q("x", "email")] },
    { questions: [q("x", "unknown")] },
    { status: "published" },
    {
      status: "published",
      questions: [q("x", "multiple-choice", true, ["A"])],
    },
  ]) {
    assert.equal(
      (await request("/forms", "POST", form)).status,
      400,
      JSON.stringify(form),
    );
  }
  assert.equal(
    (
      await request("/forms", "POST", {
        questions: [{ id: "x", type: "short-text", title: "" }],
      })
    ).status,
    201,
  );
  assert.equal((await request("/missing")).status, 404);
});

test("SQLite survives reopening and never reseeds an initialized empty workspace", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "openform-db-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const file = join(directory, "nested", "database.sqlite");
  let db = openDatabase(file);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM forms").get().n, 6);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM responses").get().n, 0);
  const id = db.prepare("SELECT id FROM forms LIMIT 1").get().id;
  db.prepare("UPDATE forms SET title=? WHERE id=?").run("Saved title", id);
  db.close();
  db = openDatabase(file);
  assert.equal(
    db.prepare("SELECT title FROM forms WHERE id=?").get(id).title,
    "Saved title",
  );
  db.exec("DELETE FROM forms");
  db.close();
  db = openDatabase(file);
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM forms").get().n, 0);
  db.close();
});

test("production serves SPA routes while keeping unknown API routes JSON", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "openform-static-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  mkdirSync(join(directory, "dist"));
  writeFileSync(join(directory, "dist", "index.html"), "<html>Openform</html>");
  const { server } = await fixture(t, {
    staticDirectory: join(directory, "dist"),
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const formRoute = await fetch(`${base}/f/shared-id`);
  assert.equal(formRoute.status, 200);
  assert.match(await formRoute.text(), /Openform/);
  const missing = await fetch(`${base}/api/unknown`);
  assert.equal(missing.status, 404);
  assert.match(missing.headers.get("content-type"), /application\/json/);
});
