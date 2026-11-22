const DRAFT_VERSION = 1;

export function formDraftKey({ role, userId, formId }) {
  if (!role || !userId || !formId) return null;
  return `routecargo:draft:v${DRAFT_VERSION}:${encodeURIComponent(role)}:${encodeURIComponent(userId)}:${encodeURIComponent(formId)}`;
}

export function readDraft(key, initialValue, validate = () => true, restore = value => value) {
  if (!key || typeof localStorage === "undefined") return initialValue;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    if (saved?.version !== DRAFT_VERSION || !validate(saved.data)) return initialValue;
    return restore(saved.data, initialValue);
  } catch {
    return initialValue;
  }
}

export function writeDraft(key, data) {
  if (!key || typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify({ version: DRAFT_VERSION, data, updatedAt: Date.now() }));
  } catch {
    // Storage can be disabled or full; the form remains usable in memory.
  }
}

export function clearStoredDraft(key) {
  if (!key || typeof localStorage === "undefined") return;
  try { localStorage.removeItem(key); } catch { /* Storage can be disabled. */ }
}
