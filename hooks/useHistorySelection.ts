// hooks/useHistorySelection.ts
// Selection state for History's multi-select delete: enter/leave selection mode,
// toggle rows, select-all, and clear. Kept out of the screen so History stays a
// thin composition layer.
import { useCallback, useMemo, useState } from 'react';

export const useHistorySelection = () => {
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const reset = useCallback(() => {
    setSelecting(false);
    setSelected(new Set());
  }, []);

  // Enter selection mode with one row already picked (long-press entry point).
  const begin = useCallback((id: string) => {
    setSelecting(true);
    setSelected(new Set([id]));
  }, []);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelected(new Set(ids));
  }, []);

  const api = useMemo(
    () => ({ selecting, selected, setSelecting, reset, begin, toggle, selectAll }),
    [selecting, selected, reset, begin, toggle, selectAll]
  );
  return api;
};
