import { useState } from "react";

const STORAGE_KEY = "theme";

// Reads whatever the inline script in index.html already applied to
// <html data-theme="..."> on first paint (avoids a flash of the wrong
// theme before React hydrates) rather than recomputing it here.
function initialTheme() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState(initialTheme);

  // Only an explicit toggle writes to localStorage/the DOM attribute — a
  // visitor who never touches the toggle keeps following their system's
  // color scheme on every future visit instead of getting pinned to
  // whatever it happened to resolve to on their first load.
  const toggle = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Private browsing / storage disabled — theme still applies for
        // this load, it just won't persist across visits.
      }
      return next;
    });
  };

  return { theme, toggle };
}
