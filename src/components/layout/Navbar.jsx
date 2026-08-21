import { useRef, useState } from "react";
import { useScrollY } from "../../hooks/useScrollY";
import { useTheme } from "../../hooks/useTheme";
import MenuOverlay from "./MenuOverlay";

// Multi-page nav: a single menu toggle at every breakpoint opens
// MenuOverlay, rather than an inline link row that only made sense when
// every section lived on one scrolling page. `active` is now the current
// page id (from App.jsx's routing), not a scroll-observed section.
export default function Navbar({ active }) {
  const { theme, toggle: toggleTheme } = useTheme();
  const scrollY = useScrollY();
  const scrolled = scrollY > 24;
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef(null);

  // On Home, the hero already shows "Marzia Saidi" at full size, so the
  // nav wordmark only fades in once you've scrolled past it (avoids two
  // giant names on screen at once). Every other page has no such
  // headline, so the wordmark is the primary "go home" affordance and
  // shows immediately.
  const showWordmark = active !== "home" || scrolled;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${
        scrolled ? "bg-background/90 backdrop-blur-sm border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-20 flex items-center justify-between">
        <a
          href="#/"
          className={`font-serif text-2xl text-text tracking-wide transition-opacity duration-300 ${
            showWordmark ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Marzia Saidi, back to home"
        >
          Marzia Saidi
        </a>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-border text-text-secondary transition-colors duration-300 hover:text-text hover:border-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="12" cy="12" r="4.5" />
                <path strokeLinecap="round" d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent text-white transition-colors duration-300 hover:bg-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V4M6 9l6-6 6 6" />
            </svg>
          </button>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-border text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l10 10M17 7L7 17" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h11M4 17h14" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <MenuOverlay
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        active={active}
        triggerRef={toggleRef}
      />
    </header>
  );
}
