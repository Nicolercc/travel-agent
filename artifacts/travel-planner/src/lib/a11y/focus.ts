import { useCallback, useEffect, useRef } from "react";

/**
 * Move focus to an element by id after the next render commits — for when the element that had
 * focus is about to disappear or move (a resolved issue, a card changing section).
 * Each id is tried in order; the first one that exists receives focus.
 */
export function useFocusAfterRender(): (...ids: string[]) => void {
  const pending = useRef<string[] | null>(null);
  useEffect(() => {
    if (!pending.current) return;
    const ids = pending.current;
    pending.current = null;
    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) {
        element.focus();
        return;
      }
    }
  });
  return useCallback((...ids: string[]) => {
    pending.current = ids;
  }, []);
}
