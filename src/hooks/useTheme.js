import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";
// Same-document broadcast so every independent useTheme() call (Navbar,
// Hero, ...) re-renders when any one of them toggles — this hook is a
// plain useState, not a shared context, so without this event each
// instance would only ever know the theme it mounted with.
const THEME_EVENT = "app:theme-change";

// Reads whatever the inline script in index.html already applied to
// <html data-theme="..."> on first paint (avoids a flash of the wrong
// theme before React hydrates) rather than recomputing it here.
function initialTheme() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    const onThemeChange = (e) => setTheme(e.detail);
    window.addEventListener(THEME_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_EVENT, onThemeChange);
  }, []);

  // Only an explicit toggle writes to localStorage/the DOM attribute — a
  // visitor who never touches the toggle keeps following their system's
  // color scheme on every future visit instead of getting pinned to
  // whatever it happened to resolve to on their first load.
  //
  // The DOM/event side effects happen here in the plain function body,
  // not inside a setTheme(current => ...) updater — React invokes that
  // updater during the calling component's render phase, so dispatching
  // a synchronous window event from in there re-enters React (every
  // other useTheme() instance's listener calls its own setTheme) *while*
  // the first component is still rendering, which React rejects ("Cannot
  // update a component while rendering a different component"). Reading
  // `theme` from the closure and calling setTheme with a plain value
  // keeps all of that in the event handler instead, after React's own
  // render pass.
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private browsing / storage disabled — theme still applies for
      // this load, it just won't persist across visits.
    }
    setTheme(next);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
  };

  return { theme, toggle };
}
