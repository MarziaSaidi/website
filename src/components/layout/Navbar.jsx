import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { useScrollY } from "../../hooks/useScrollY";

const LINKS = [
  { href: "#selected-work", id: "selected-work", label: "Work" },
  { href: "#experience", id: "experience", label: "Experience" },
  { href: "#about", id: "about", label: "About" },
  { href: "#contact", id: "contact", label: "Contact" },
];

export default function Navbar({ active }) {
  const scrollY = useScrollY();
  const scrolled = scrollY > 24;
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });
  const navRef = useRef(null);

  // Hover takes over the indicator momentarily; releasing it falls back to
  // wherever the user actually is on the page.
  const target = hovered ?? active;

  useLayoutEffect(() => {
    const nav = navRef.current;
    const el = nav && target && nav.querySelector(`a[data-id="${target}"]`);
    if (!el) {
      setIndicator((s) => (s.ready ? { ...s, ready: false } : s));
      return;
    }
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
  }, [target]);

  useEffect(() => {
    function onResize() {
      const nav = navRef.current;
      const el = nav && target && nav.querySelector(`a[data-id="${target}"]`);
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth, ready: true });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [target]);

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
          href="#top"
          className={`font-serif text-2xl text-text tracking-wide transition-opacity duration-300 ${
            scrolled ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-label="Marzia Saidi, back to top"
        >
          Marzia Saidi
        </a>

        <nav
          ref={navRef}
          aria-label="Primary"
          onMouseLeave={() => setHovered(null)}
          className="relative hidden md:flex items-center gap-10"
        >
          {/* One shared indicator that slides between links, rather than a
              separate underline animation per link — it tracks the active
              section and hands off to whatever's hovered. */}
          <span
            aria-hidden="true"
            className="absolute -bottom-1.5 h-px bg-bronze transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              width: `${indicator.width}px`,
              transform: `translateX(${indicator.left}px)`,
              opacity: indicator.ready ? 1 : 0,
            }}
          />
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              data-id={link.id}
              onMouseEnter={() => setHovered(link.id)}
              aria-current={active === link.id ? "true" : undefined}
              className={`relative text-sm tracking-wide transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm ${
                active === link.id ? "text-text" : "text-text-secondary hover:text-text"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent text-text transition-colors duration-300 hover:bg-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20V4M6 9l6-6 6 6" />
            </svg>
          </button>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-border text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
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

      <nav
        aria-label="Mobile"
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out bg-background border-b border-border ${
          menuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col px-6 py-4 gap-4">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              aria-current={active === link.id ? "true" : undefined}
              className={`text-base transition-colors ${
                active === link.id ? "text-text" : "text-text-secondary hover:text-text"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
