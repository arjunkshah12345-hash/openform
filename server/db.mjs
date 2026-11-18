import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";

export const THEMES = ["sage", "peach", "lilac", "blue", "sand", "rose"];
export const QUESTION_TYPES = [
  "short-text",
  "long-text",
  "email",
  "multiple-choice",
  "rating",
  "number",
  "yes-no",
];
export const question = (type, title, required = true, options = []) => ({
  id: randomUUID(),
  type,
  title,
  description: "",
  required,
  options,
});

function seedForms() {
  return [
    {
      title: "Customer feedback",
      description:
        "A little feedback goes a long way. Help us make your experience even better.",
      status: "published",
      theme: "sage",
      questions: [
        question("short-text", "First things first, what’s your name?"),
        question("rating", "How would you rate your experience?"),
        question("multiple-choice", "What did you enjoy the most?", true, [
          "The product",
          "The people",
          "The little details",
          "All of the above",
        ]),
        question("long-text", "What could we do better?", false),
      ],
    },
    {
      title: "Let’s get to know you",
      description:
        "Good conversations start with a hello. Tell us a little about yourself.",
      status: "published",
      theme: "peach",
      questions: [
        question("short-text", "Hey there! What’s your name?"),
        question("email", "What’s your email address?"),
        question("multiple-choice", "What brings you here?", true, [
          "Just exploring",
          "Looking for inspiration",
          "Ready to collaborate",
        ]),
        question("long-text", "Anything else you’d like us to know?", false),
      ],
    },
    {
      title: "Website feedback",
      description:
        "Your fresh perspective helps us build a better place on the internet.",
      status: "draft",
      theme: "lilac",
      questions: [
        question("rating", "How easy was it to find what you needed?"),
        question("yes-no", "Did you find what you were looking for?"),
        question(
          "long-text",
          "What would you change about our website?",
          false,
        ),
      ],
    },
    {
      title: "Event registration",
      description: "Save your spot. We can’t wait to see you there.",
      status: "published",
      theme: "blue",
      questions: [
        question("short-text", "What’s your full name?"),
        question("email", "Where should we send your confirmation?"),
        question("multiple-choice", "Which session are you joining?", true, [
          "Morning session",
          "Afternoon session",
          "Both sessions",
        ]),
        question("long-text", "Any accessibility or dietary needs?", false),
      ],
    },
    {
      title: "Join our team",
      description:
        "Great work starts with great people. Let’s find out if we’re a good fit.",
      status: "draft",
      theme: "sand",
      questions: [
        question("short-text", "What’s your name?"),
        question("email", "What’s the best email to reach you?"),
        question("multiple-choice", "Where do you do your best work?", true, [
          "Design",
          "Engineering",
          "Marketing",
          "Operations",
        ]),
        question("long-text", "Tell us about something you’re proud of."),
      ],
    },
    {
      title: "A little check-in",
      description:
        "Take a breath and tell us how things are going. We’re listening.",
      status: "draft",
      theme: "rose",
      questions: [
        question("rating", "How are you feeling this week?"),
        question("long-text", "What’s been going well?", false),
        question("long-text", "Where could you use a little support?", false),
      ],
    },
  ];
}

export function openDatabase(
  filename = process.env.DATABASE_PATH || resolve("data/openform.sqlite"),
  { seed = true } = {},
) {
  if (filename !== ":memory:")
    mkdirSync(dirname(resolve(filename)), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  const initialized = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'forms'",
    )
    .get();
  db.exec(`CREATE TABLE IF NOT EXISTS forms (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, status TEXT NOT NULL,
    theme TEXT NOT NULL, questions TEXT NOT NULL, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL, trashed INTEGER NOT NULL DEFAULT 0
  ); CREATE TABLE IF NOT EXISTS responses (
    id TEXT PRIMARY KEY, formId TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    answers TEXT NOT NULL, createdAt TEXT NOT NULL, questions TEXT DEFAULT NULL
  ); CREATE INDEX IF NOT EXISTS responses_form ON responses(formId);`);
  if (
    !db
      .prepare("PRAGMA table_info(responses)")
      .all()
      .some((column) => column.name === "questions")
  ) {
    db.exec("ALTER TABLE responses ADD COLUMN questions TEXT DEFAULT NULL");
  }
  if (!initialized && seed) {
    const insert = db.prepare(
      "INSERT INTO forms (id,title,description,status,theme,questions,createdAt,updatedAt,trashed) VALUES (?,?,?,?,?,?,?,?,0)",
    );
    seedForms().forEach((form, i) => {
      const now = new Date(Date.now() - i * 86400000).toISOString();
      insert.run(
        randomUUID(),
        form.title,
        form.description,
        form.status,
        form.theme,
        JSON.stringify(form.questions),
        now,
        now,
      );
    });
  }
  return db;
}

export function serializeForm(row) {
  if (!row) return null;
  return {
    ...row,
    questions: JSON.parse(row.questions),
    trashed: Boolean(row.trashed),
    responseCount: Number(row.responseCount ?? 0),
  };
}
export const FORM_SELECT =
  "SELECT forms.*, (SELECT COUNT(*) FROM responses WHERE responses.formId = forms.id) AS responseCount FROM forms";
export function getForm(db, id) {
  return serializeForm(db.prepare(`${FORM_SELECT} WHERE id = ?`).get(id));
}
