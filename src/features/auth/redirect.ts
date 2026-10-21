const KEY = "postAuthRedirect";
const MAX_AGE_MS = 60 * 60 * 1000;

const isSafe = (p: unknown): p is string =>
  typeof p === "string" && p.startsWith("/") && !p.startsWith("//");

export function savePostAuthRedirect(path?: string | null) {
  if (!isSafe(path) || path.startsWith("/auth")) return;
  localStorage.setItem(KEY, JSON.stringify({ path, t: Date.now() }));
}

export function popPostAuthRedirect(): string {
  try {
    const raw = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    if (!raw) return "/";
    const { path, t } = JSON.parse(raw);
    return isSafe(path) && Date.now() - t < MAX_AGE_MS ? path : "/";
  } catch {
    return "/";
  }
}