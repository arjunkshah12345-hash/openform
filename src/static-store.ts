import type { Form, Question, QuestionType, Submission } from "./types";
import { templateData } from "./templates.ts";

const KEY = "openform-demo-v1";
const TYPES = [
  "short-text",
  "long-text",
  "email",
  "multiple-choice",
  "rating",
  "number",
  "yes-no",
];
const THEMES = ["sage", "peach", "lilac", "blue", "sand", "rose"];
type State = { version: 1; forms: Form[]; responses: Submission[] };
const copy = <T>(value: T): T => structuredClone(value);
const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
function text(value: unknown, name: string, max = 10000): string {
  if (typeof value !== "string" || value.length > max)
    throw new Error(`${name} must be text, at most ${max} characters.`);
  return value;
}
function validateForm(input: unknown, previous?: Form): Form {
  if (!object(input)) throw new Error("Provide a form object.");
  const now = new Date().toISOString();
  const form: Form = previous
    ? copy(previous)
    : {
        id: crypto.randomUUID(),
        title: "Untitled form",
        description: "",
        status: "draft",
        theme: "sage",
        questions: [],
        createdAt: now,
        updatedAt: now,
        responseCount: 0,
        trashed: false,
      };
  if ("title" in input) form.title = text(input.title, "Form title", 200);
  if ("description" in input)
    form.description = text(input.description, "Form description");
  if ("theme" in input) {
    if (typeof input.theme !== "string" || !THEMES.includes(input.theme))
      throw new Error("Choose a valid theme.");
    form.theme = input.theme;
  }
  if ("status" in input) {
    if (input.status !== "draft" && input.status !== "published")
      throw new Error("Choose draft or published.");
    form.status = input.status;
  }
  if ("trashed" in input) {
    if (typeof input.trashed !== "boolean")
      throw new Error("Trashed must be true or false.");
    form.trashed = input.trashed;
  }
  if ("questions" in input) {
    if (!Array.isArray(input.questions) || input.questions.length > 100)
      throw new Error("Forms can contain at most 100 questions.");
    const seen = new Set<string>();
    form.questions = input.questions.map((q: unknown, i: number): Question => {
      if (!object(q)) throw new Error(`Question ${i + 1} is invalid.`);
      const id = text(q.id, "Question ID", 100);
      if (
        !id ||
        ["constructor", "prototype", "__proto__"].includes(id) ||
        seen.has(id)
      )
        throw new Error("Question IDs must be unique and valid.");
      seen.add(id);
      if (typeof q.type !== "string" || !TYPES.includes(q.type))
        throw new Error("Choose a valid question type.");
      if (typeof q.required !== "boolean")
        throw new Error("Required must be true or false.");
      if (!Array.isArray(q.options) || q.options.length > 50)
        throw new Error("Provide up to 50 answer options.");
      return {
        id,
        type: q.type as QuestionType,
        title: text(q.title, "Question title", 1000),
        description: text(q.description || "", "Question description"),
        required: q.required,
        options: q.options.map((o) => text(o, "Answer option", 500)),
      };
    });
  }
  if (form.status === "published") {
    if (!form.title.trim())
      throw new Error("Give your form a title before publishing.");
    if (!form.questions.length)
      throw new Error("Add at least one question before publishing.");
    for (const q of form.questions) {
      if (!q.title.trim())
        throw new Error("Give every question a title before publishing.");
      if (
        q.type === "multiple-choice" &&
        (q.options.length < 2 ||
          q.options.some((o) => !o.trim()) ||
          new Set(q.options).size !== q.options.length)
      )
        throw new Error(
          "Multiple-choice questions need at least two unique, non-empty options.",
        );
    }
  }
  return form;
}
function seed(): State {
  return {
    version: 1,
    responses: [],
    forms: templateData.map((t, i) => {
      const form = validateForm({
        title: t.title,
        description: t.description,
        questions: t.questions(),
        theme: t.theme,
        status: [0, 1, 3].includes(i) ? "published" : "draft",
      });
      form.createdAt = form.updatedAt = new Date(
        Date.now() - i * 86400000,
      ).toISOString();
      return form;
    }),
  };
}
function load(): State {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const initial = seed();
    save(initial);
    return initial;
  }
  try {
    const state = JSON.parse(raw);
    if (
      state.version !== 1 ||
      !Array.isArray(state.forms) ||
      !Array.isArray(state.responses)
    )
      throw new Error();
    return state;
  } catch {
    throw new Error(
      "Your demo data couldn’t be read. Export or clear this site’s local data to reset the demo.",
    );
  }
}
function save(state: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    throw new Error(
      "Your browser storage is full or unavailable. Changes weren’t saved.",
    );
  }
}
function publicSnapshot(value: unknown, id: string): Form | undefined {
  if (
    !object(value) ||
    value.id !== id ||
    value.status !== "published" ||
    value.trashed
  )
    return;
  const form = validateForm(value);
  form.id = text(value.id, "Form ID", 100);
  return form;
}
function validateAnswers(
  form: Form,
  input: unknown,
): Record<string, string | number> {
  if (!object(input)) throw new Error("Provide an answers object.");
  const ids = new Set(form.questions.map((q) => q.id));
  if (Object.keys(input).some((id) => !ids.has(id)))
    throw new Error("An answer refers to an unknown question.");
  const answers: Record<string, string | number> = Object.create(null);
  for (const q of form.questions) {
    const value = Object.hasOwn(input, q.id) ? input[q.id] : undefined;
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && !value.trim())
    ) {
      if (q.required) throw new Error(`“${q.title}” is required.`);
      continue;
    }
    if (typeof value !== "string" && typeof value !== "number")
      throw new Error("Enter a valid answer.");
    if (q.type === "rating" || q.type === "number") {
      const numeric = Number(value);
      if (
        !Number.isFinite(numeric) ||
        (q.type === "rating" &&
          (!Number.isInteger(numeric) || numeric < 1 || numeric > 5))
      )
        throw new Error(
          q.type === "rating"
            ? "Choose a rating from 1 to 5."
            : "Enter a valid number.",
        );
      answers[q.id] = numeric;
    } else {
      const answer = text(value, "Answer");
      if (q.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answer))
        throw new Error("Enter a valid email address.");
      if (q.type === "multiple-choice" && !q.options.includes(answer))
        throw new Error("Choose an available option.");
      if (q.type === "yes-no" && !["Yes", "No"].includes(answer))
        throw new Error("Choose Yes or No.");
      answers[q.id] = answer;
    }
  }
  return answers;
}
export async function staticRequest<T>(
  path: string,
  options: RequestInit = {},
  snapshot?: unknown,
): Promise<T> {
  const state = load();
  const method = options.method || "GET";
  const input = options.body ? JSON.parse(String(options.body)) : {};
  const parts = path.split("/").filter(Boolean);
  const isPublic = parts[0] === "public";
  const id = parts[isPublic ? 2 : 1];
  const found = state.forms.find((f) => f.id === id);
  const form = isPublic
    ? snapshot
      ? publicSnapshot(snapshot, id)
      : found && !found.trashed && found.status === "published"
        ? found
        : undefined
    : found;
  const withCount = (f: Form) => ({
    ...f,
    responseCount: state.responses.filter((r) => r.formId === f.id).length,
  });
  let result: unknown;
  let changed = false;
  if (
    !isPublic &&
    parts.length === 1 &&
    parts[0] === "forms" &&
    method === "GET"
  )
    result = state.forms
      .map(withCount)
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  else if (
    !isPublic &&
    parts.length === 1 &&
    parts[0] === "forms" &&
    method === "POST"
  ) {
    const created = validateForm(input);
    state.forms.unshift(created);
    result = created;
    changed = true;
  } else {
    if (!form)
      throw new Error(
        isPublic ? "This form isn’t available." : "Form not found.",
      );
    if ((isPublic ? parts[3] : parts[2]) === "responses") {
      if (method === "GET" && !isPublic)
        result = state.responses.filter((r) => r.formId === id).reverse();
      else if (method === "POST" && isPublic) {
        const submission: Submission = {
          id: crypto.randomUUID(),
          formId: id,
          answers: validateAnswers(form, input.answers),
          questions: copy(form.questions),
          createdAt: new Date().toISOString(),
        };
        state.responses.push(submission);
        result = submission;
        changed = true;
      } else throw new Error("This action isn’t available.");
    } else if (!isPublic && parts[2] === "duplicate" && method === "POST") {
      const duplicate = validateForm({
        ...form,
        title: `${form.title.slice(0, 190)} (copy)`,
        status: "draft",
        trashed: false,
        questions: form.questions.map((q) => ({
          ...q,
          id: crypto.randomUUID(),
        })),
      });
      state.forms.unshift(duplicate);
      result = duplicate;
      changed = true;
    } else if (method === "GET") result = withCount(form);
    else if (!isPublic && method === "PUT") {
      const updated = validateForm(input, form);
      updated.updatedAt = new Date().toISOString();
      state.forms[state.forms.findIndex((f) => f.id === id)] = updated;
      result = withCount(updated);
      changed = true;
    } else if (!isPublic && method === "DELETE") {
      state.forms = state.forms.filter((f) => f.id !== id);
      state.responses = state.responses.filter((r) => r.formId !== id);
      changed = true;
    } else throw new Error("This action isn’t available.");
  }
  if (changed) save(state);
  return copy(result) as T;
}
