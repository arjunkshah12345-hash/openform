import type { Form } from "./types";

export const STATIC_DEMO = import.meta.env.VITE_STATIC_DEMO === "true";
export const REPO_URL =
  import.meta.env.VITE_REPO_URL ||
  "https://github.com/arjunkshah12345-hash/openform";
const base = import.meta.env.BASE_URL || "/";
export function currentRoute() {
  const path = STATIC_DEMO
    ? location.hash.slice(1).split("?")[0]
    : location.pathname;
  return path || "/";
}
export function routeUrl(path: string) {
  return STATIC_DEMO ? `${base}#${path}` : path;
}
export function navigateRoute(path: string) {
  history.pushState({}, "", routeUrl(path));
  window.dispatchEvent(new Event("openform:navigate"));
  window.scrollTo(0, 0);
}
export function sharedFormUrl(form: Form) {
  const url = new URL(
    routeUrl(`/f/${encodeURIComponent(form.id)}`),
    location.origin,
  );
  if (STATIC_DEMO) {
    const snapshot = { ...form, responseCount: 0, trashed: false };
    const bytes = new TextEncoder().encode(JSON.stringify(snapshot));
    const encoded = btoa(
      Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""),
    )
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replace(/=+$/, "");
    url.hash += `?form=${encoded}`;
  }
  return url.toString();
}
export function demoSnapshot(): unknown {
  const encoded = new URLSearchParams(location.hash.split("?")[1] || "").get(
    "form",
  );
  if (!encoded) return null;
  if (encoded.length > 1500000) throw new Error("This demo link is too large.");
  try {
    const raw = atob(encoded.replaceAll("-", "+").replaceAll("_", "/"));
    return JSON.parse(
      new TextDecoder().decode(Uint8Array.from(raw, (c) => c.charCodeAt(0))),
    );
  } catch {
    throw new Error("This demo link is incomplete or invalid.");
  }
}
