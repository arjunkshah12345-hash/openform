import type { Form, Submission } from "./types";
import { STATIC_DEMO, demoSnapshot } from "./routing";
import { staticRequest } from "./static-store";
export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (STATIC_DEMO)
    return staticRequest<T>(
      path,
      options,
      path.startsWith("/public/") ? demoSnapshot() : undefined,
    );
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || "Something went wrong. Please try again.");
  }
  return response.status === 204 ? (undefined as T) : response.json();
}
export const api = {
  forms: () => request<Form[]>("/forms"),
  create: (form: Partial<Form>) =>
    request<Form>("/forms", { method: "POST", body: JSON.stringify(form) }),
  update: (id: string, form: Partial<Form>) =>
    request<Form>(`/forms/${id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    }),
  duplicate: (id: string) =>
    request<Form>(`/forms/${id}/duplicate`, { method: "POST" }),
  remove: (id: string) => request<void>(`/forms/${id}`, { method: "DELETE" }),
  responses: (id: string) => request<Submission[]>(`/forms/${id}/responses`),
};
export const newQuestion = (
  type: import("./types").QuestionType = "short-text",
) => ({
  id: crypto.randomUUID(),
  type,
  title: "",
  description: "",
  required: true,
  options:
    type === "multiple-choice" ? ["Option 1", "Option 2", "Option 3"] : [],
});
export function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
