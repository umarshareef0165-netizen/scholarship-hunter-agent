const STORAGE_KEY = "scholarship-hunter-viewer-id";

/**
 * Stable anonymous id for this browser. Used as the viewer id for
 * profiles and tracking when the user is not signed in, so the app works
 * fully without an account. Never a real identity.
 */
export function getViewerId(): string {
  if (typeof window === "undefined") return "local-dev";
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
    window.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return "local-dev";
  }
}
