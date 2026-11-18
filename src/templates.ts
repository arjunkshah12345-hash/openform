import type { Form, QuestionType } from "./types";
const q = (
  title: string,
  type: QuestionType = "short-text",
  options: string[] = [],
) => ({
  id: crypto.randomUUID(),
  title,
  type,
  description: "",
  required: true,
  options,
});
export const templateData = [
  {
    title: "Customer feedback",
    description: "Help us make your next experience even better.",
    theme: "sage",
    category: "Feedback",
    questions: () => [
      q("How would you rate your experience?", "rating"),
      q("What did you love most?", "long-text"),
      q("What could we do better?", "long-text"),
    ],
  },
  {
    title: "Let’s get to know you",
    description:
      "Big ideas start with a simple hello. Tell us a little about yourself.",
    theme: "peach",
    category: "Lead generation",
    questions: () => [
      q("First things first, what’s your name?"),
      q("What’s your email address?", "email"),
      q("What brings you here?", "multiple-choice", [
        "Just exploring",
        "Looking for a solution",
        "Ready to get started",
      ]),
    ],
  },
  {
    title: "Website feedback",
    description: "A few quick questions to help us build a better website.",
    theme: "lilac",
    category: "Research",
    questions: () => [
      q("Did you find what you were looking for?", "yes-no"),
      q("How easy was it to use our website?", "rating"),
      q("What would make it better?", "long-text"),
    ],
  },
  {
    title: "Event registration",
    description: "Good people, great conversations. Save your spot.",
    theme: "blue",
    category: "Registration",
    questions: () => [
      q("What’s your full name?"),
      q("Where should we send your invitation?", "email"),
      q("Which session would you like to attend?", "multiple-choice", [
        "Morning session",
        "Afternoon session",
        "Both sessions",
      ]),
    ],
  },
  {
    title: "Join our team",
    description: "Great work starts with great people. Let’s meet.",
    theme: "sand",
    category: "Applications",
    questions: () => [
      q("What’s your name?"),
      q("What’s your email address?", "email"),
      q("Which role interests you?", "multiple-choice", [
        "Design",
        "Engineering",
        "Marketing",
        "Other",
      ]),
      q("Tell us about something you’re proud of.", "long-text"),
    ],
  },
  {
    title: "A little check-in",
    description: "Take a breath. Let us know how you’re doing.",
    theme: "rose",
    category: "Feedback",
    questions: () => [
      q("How are you feeling today?", "rating"),
      q("What’s been on your mind?", "long-text"),
      q("Is there anything we can help with?", "long-text"),
    ],
  },
];
export function fromTemplate(index: number): Partial<Form> {
  const t = templateData[index];
  return {
    title: t.title,
    description: t.description,
    theme: t.theme,
    questions: t.questions(),
    status: "draft",
  };
}
