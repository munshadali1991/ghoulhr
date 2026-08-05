import { useCallback, useState } from 'react';

export const DRAWER_WIDTH = 280;
export const DRAWER_WIDTH_COLLAPSED = 72;

const STORAGE_KEY = 'ghoulhr.sidebar.collapsed';

function readStoredCollapsed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return true;
    return raw === 'true';
  } catch {
    return true;
  }
}

/**
 * Desktop sidebar collapse state. Defaults to collapsed; persists preference.
 * @returns {{ collapsed: boolean, toggleCollapsed: () => void, setCollapsed: (value: boolean) => void }}
 */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsedState] = useState(readStoredCollapsed);

  const setCollapsed = useCallback((value) => {
    setCollapsedState(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(Boolean(value)));
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  return { collapsed, toggleCollapsed, setCollapsed };
}
