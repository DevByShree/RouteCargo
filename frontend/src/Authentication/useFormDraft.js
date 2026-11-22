import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { clearStoredDraft, formDraftKey, readDraft, writeDraft } from "./formDraftStorage.js";

const DEFAULT_DELAY_MS = 300;
const identity = value => value;
const acceptDraft = () => true;
const mergeDraft = (saved, initial) => initial && typeof initial === "object" && !Array.isArray(initial)
  ? { ...initial, ...saved }
  : saved;

export function useFormDraft({
  formId,
  initialValue,
  pick = identity,
  validate = acceptDraft,
  restore = mergeDraft,
  debounceMs = DEFAULT_DELAY_MS,
  enabled = true,
}) {
  const { user } = useAuth();
  const storageKey = formDraftKey({ role: user?.role, userId: user?.id, formId });
  const [snapshot, setSnapshot] = useState(() => ({
    key: storageKey,
    value: storageKey ? readDraft(storageKey, initialValue, validate, restore) : initialValue,
    dirty: false,
  }));
  if (enabled && snapshot.key !== storageKey) {
    setSnapshot({
      key: storageKey,
      value: storageKey ? readDraft(storageKey, initialValue, validate, restore) : initialValue,
      dirty: false,
    });
  }

  const value = snapshot.key === storageKey ? snapshot.value : initialValue;
  const setValue = useCallback(update => setSnapshot(current => {
    const previous = current.key === storageKey ? current.value : initialValue;
    return { key: storageKey, value: typeof update === "function" ? update(previous) : update, dirty: true };
  }), [storageKey, initialValue]);
  const timer = useRef(null);
  const skipWriteForKey = useRef(null);

  useEffect(() => {
    if (!enabled || !storageKey || snapshot.key !== storageKey) return undefined;
    if (skipWriteForKey.current === storageKey) {
      skipWriteForKey.current = null;
      return undefined;
    }
    if (!snapshot.dirty) return undefined;
    timer.current = window.setTimeout(() => writeDraft(storageKey, pick(value)), debounceMs);
    return () => window.clearTimeout(timer.current);
  }, [value, storageKey, snapshot.key, snapshot.dirty, debounceMs, enabled, pick]);

  useEffect(() => {
    if (!enabled || !storageKey || snapshot.key !== storageKey || !snapshot.dirty) return undefined;
    const persistOnExit = () => {
      if (skipWriteForKey.current !== storageKey) writeDraft(storageKey, pick(value));
    };
    window.addEventListener("pagehide", persistOnExit);
    return () => window.removeEventListener("pagehide", persistOnExit);
  }, [value, storageKey, snapshot.key, snapshot.dirty, enabled, pick]);

  const clearDraft = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    clearStoredDraft(storageKey);
    skipWriteForKey.current = storageKey;
    setSnapshot({ key: storageKey, value: initialValue, dirty: false });
  }, [storageKey, initialValue]);

  return [value, setValue, clearDraft];
}
