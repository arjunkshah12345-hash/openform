import express from "express";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  FORM_SELECT,
  getForm,
  serializeForm,
  THEMES,
  QUESTION_TYPES,
} from "./db.mjs";

const fail = (message, status = 400) =>
  Object.assign(new Error(message), { status });
const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value, name, max = 10000) => {
  if (typeof value !== "string" || value.length > max)
    throw fail(`${name} must be text, at most ${max} characters.`);
  return value;
};
function validateForm(input, previous) {
  if (!isObject(input)) throw fail("Provide a form object.");
  const form = {
    title: "Untitled form",
    description: "",
    status: "draft",
    theme: "sage",
    questions: [],
    trashed: false,
    ...previous,
  };
  if (Object.hasOwn(input, "title"))
    form.title = text(input.title, "Form title", 200);
  if (Object.hasOwn(input, "description"))
    form.description = text(input.description, "Form description");
  if (Object.hasOwn(input, "status")) {
    if (!["draft", "published"].includes(input.status))
      throw fail("Status must be draft or published.");
    form.status = input.status;
  }
  if (Object.hasOwn(input, "theme")) {
    if (!THEMES.includes(input.theme)) throw fail("Choose a valid theme.");
    form.theme = input.theme;
  }
  if (Object.hasOwn(input, "trashed")) {
    if (typeof input.trashed !== "boolean")
      throw fail("Trashed must be true or false.");
    form.trashed = input.trashed;
  }
  if (Object.hasOwn(input, "questions")) {
    if (!Array.isArray(input.questions) || input.questions.length > 100)
      throw fail("Forms can contain at most 100 questions.");
    const ids = new Set();
    form.questions = input.questions.map((q, index) => {
      if (!isObject(q)) throw fail(`Question ${index + 1} must be an object.`);
      const id = text(q.id ?? randomUUID(), "Question ID", 100);
      if (
        !id ||
        ["__proto__", "constructor", "prototype"].includes(id) ||
        ids.has(id)
      )
        throw fail("Question IDs must be unique and valid.");
      ids.add(id);
      if (!QUESTION_TYPES.includes(q.type))
        throw fail(`Question ${index + 1} has an invalid type.`);
      if (q.required !== undefined && typeof q.required !== "boolean")
        throw fail("Required must be true or false.");
      const options = q.options ?? [];
      if (!Array.isArray(options) || options.length > 50)
        throw fail("Provide up to 50 options per question.");
      return {
        id,
        type: q.type,
        title: text(q.title ?? "", "Question title", 1000),
        description: text(q.description ?? "", "Question description"),
        required: q.required ?? false,
        options: options.map((option) => text(option, "Option", 500)),
      };
    });
  }
  if (form.status === "published") {
    if (!form.title.trim())
      throw fail("Give your form a title before publishing.");
    if (!form.questions.length)
      throw fail("Add at least one question before publishing.");
    for (const q of form.questions) {
      if (!q.title.trim())
        throw fail("Give every question a title before publishing.");
      if (
        q.type === "multiple-choice" &&
        (q.options.length < 2 ||
          q.options.some((o) => !o.trim()) ||
          new Set(q.options).size !== q.options.length)
      )
        throw fail(
          "Multiple-choice questions need at least two unique, non-empty options.",
        );
    }
  }
  return form;
}

function validateAnswers(form, body) {
  if (!isObject(body) || !isObject(body.answers))
    throw fail("Provide an answers object.");
  const validIds = new Set(form.questions.map((q) => q.id));
  for (const id of Object.keys(body.answers))
    if (!validIds.has(id))
      throw fail("An answer refers to an unknown question.");
  const answers = Object.create(null);
  for (const q of form.questions) {
    const value = Object.hasOwn(body.answers, q.id)
      ? body.answers[q.id]
      : undefined;
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && !value.trim())
    ) {
      if (q.required) throw fail(`“${q.title}” is required.`);
      continue;
    }
    if (!["string", "number"].includes(typeof value))
      throw fail(`Enter a valid answer for “${q.title}”.`);
    if (q.type === "rating" || q.type === "number") {
      const numeric = typeof value === "number" ? value : Number(value);
      if (
        !Number.isFinite(numeric) ||
        (q.type === "rating" &&
          (!Number.isInteger(numeric) || numeric < 1 || numeric > 5))
      )
        throw fail(
          q.type === "rating"
            ? "Choose a rating from 1 to 5."
            : "Enter a valid number.",
        );
      answers[q.id] = numeric;
    } else {
      const answer = text(value, "Answer");
      if (q.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer))
        throw fail("Enter a valid email address.");
      if (q.type === "multiple-choice" && !q.options.includes(answer))
        throw fail("Choose one of the available options.");
      if (q.type === "yes-no" && !["Yes", "No"].includes(answer))
        throw fail("Choose Yes or No.");
      answers[q.id] = answer;
    }
  }
  return answers;
}

export function createApp(db, { staticDirectory = resolve("dist") } = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    next();
  });
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.use("/api", express.json({ limit: "1mb" }));
  const requireForm = (id) => {
    const form = getForm(db, id);
    if (!form) throw fail("Form not found.", 404);
    return form;
  };
  const requirePublicForm = (id) => {
    const form = requireForm(id);
    if (form.trashed || form.status !== "published")
      throw fail("This form isn’t available.", 404);
    return form;
  };
  const insertForm = (form) => {
    const now = new Date().toISOString();
    const id = randomUUID();
    db.prepare(
      "INSERT INTO forms (id,title,description,status,theme,questions,createdAt,updatedAt,trashed) VALUES (?,?,?,?,?,?,?,?,?)",
    ).run(
      id,
      form.title,
      form.description,
      form.status,
      form.theme,
      JSON.stringify(form.questions),
      now,
      now,
      Number(form.trashed),
    );
    return getForm(db, id);
  };
  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.get("/api/forms", (_req, res) =>
    res.json(
      db
        .prepare(`${FORM_SELECT} ORDER BY updatedAt DESC, rowid DESC`)
        .all()
        .map(serializeForm),
    ),
  );
  app.post("/api/forms", (req, res) =>
    res.status(201).json(insertForm(validateForm(req.body))),
  );
  app.get("/api/forms/:id", (req, res) => res.json(requireForm(req.params.id)));
  app.put("/api/forms/:id", (req, res) => {
    const form = validateForm(req.body, requireForm(req.params.id));
    db.prepare(
      "UPDATE forms SET title=?,description=?,status=?,theme=?,questions=?,updatedAt=?,trashed=? WHERE id=?",
    ).run(
      form.title,
      form.description,
      form.status,
      form.theme,
      JSON.stringify(form.questions),
      new Date().toISOString(),
      Number(form.trashed),
      req.params.id,
    );
    res.json(requireForm(req.params.id));
  });
  app.delete("/api/forms/:id", (req, res) => {
    requireForm(req.params.id);
    db.prepare("DELETE FROM forms WHERE id=?").run(req.params.id);
    res.status(204).end();
  });
  app.post("/api/forms/:id/duplicate", (req, res) => {
    const form = requireForm(req.params.id);
    res
      .status(201)
      .json(
        insertForm({
          ...form,
          title: `${form.title.slice(0, 190)} (copy)`,
          status: "draft",
          trashed: false,
          questions: form.questions.map((q) => ({ ...q, id: randomUUID() })),
        }),
      );
  });
  app.get("/api/forms/:id/responses", (req, res) => {
    const form = requireForm(req.params.id);
    res.json(
      db
        .prepare(
          "SELECT * FROM responses WHERE formId=? ORDER BY createdAt DESC, rowid DESC",
        )
        .all(req.params.id)
        .map((row) => ({
          ...row,
          answers: JSON.parse(row.answers),
          questions: row.questions ? JSON.parse(row.questions) : form.questions,
        })),
    );
  });
  app.get("/api/public/forms/:id", (req, res) =>
    res.json(requirePublicForm(req.params.id)),
  );
  app.post("/api/public/forms/:id/responses", (req, res) => {
    const form = requirePublicForm(req.params.id);
    const answers = validateAnswers(form, req.body);
    const submission = {
      id: randomUUID(),
      formId: form.id,
      answers,
      questions: form.questions,
      createdAt: new Date().toISOString(),
    };
    db.prepare(
      "INSERT INTO responses (id,formId,answers,questions,createdAt) VALUES (?,?,?,?,?)",
    ).run(
      submission.id,
      form.id,
      JSON.stringify(answers),
      JSON.stringify(form.questions),
      submission.createdAt,
    );
    res.status(201).json(submission);
  });
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "API endpoint not found." }),
  );
  if (existsSync(resolve(staticDirectory, "index.html"))) {
    app.use(express.static(staticDirectory));
    app.get("/{*path}", (_req, res) =>
      res.sendFile(resolve(staticDirectory, "index.html")),
    );
  }
  app.use((error, _req, res, _next) => {
    const status =
      error.status >= 400 && error.status < 600 ? error.status : 500;
    if (status === 500) console.error(error);
    res
      .status(status)
      .json({
        error:
          status === 500
            ? "Something went wrong. Please try again."
            : error.type === "entity.parse.failed"
              ? "Invalid JSON body."
              : error.message,
      });
  });
  return app;
}
