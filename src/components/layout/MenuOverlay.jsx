import { useEffect, useRef } from "react";
import Magnetic from "../ui/Magnetic";

const LINKS = [
  { href: "#/", id: "home", label: "Home" },
  { href: "#/work", id: "work", label: "Work" },
  { href: "#/about", id: "about", label: "About" },
  { href: "#/contact", id: "contact", label: "Contact" },
];

// Full-screen nav overlay, opened from Navbar's single menu toggle at every
// breakpoint. Only mounted while open (simpler and more correct for a11y
// than hiding via opacity — closed means genuinely out of the DOM and tab
// order, not just invisible). Escape closes it and returns focus to the
// toggle button, mirroring ChatWidget's established open/close pattern.
//
// The backdrop itself is solid the instant it mounts — it does NOT carry
// the .enter fade. .enter is a full 1s opacity animation, and running it
// on the same element as bg-background meant the cream backdrop faded in
// over a page that's also cream-toned: for most of that second the
// backdrop was nearly invisible (low-contrast fade against a similar
// color) while the dark link text still read as fully legible even
// partway through the fade, producing a "text with no background,
// bleeding into the page behind it" look on every page. Now only the
// content (links, social row) carries the entrance animation, on top of
// an already-opaque backdrop.
export default function MenuOverlay({ open, onClose, active, triggerRef }) {
  const firstLinkRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    const onKey = (e) => {
      if (e.key !== "Escape") return;
      onClose();
      triggerRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, triggerRef]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      className="fixed inset-0 z-[90] bg-background"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-full flex flex-col justify-center gap-4 md:gap-6">
        {LINKS.map((link, i) => {
          const isActive = active === link.id;
          return (
            <a
              key={link.href}
              ref={i === 0 ? firstLinkRef : undefined}
              href={link.href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={`group/btn enter enter-${i + 1} flex items-baseline gap-4 md:gap-6 font-serif text-4xl md:text-6xl leading-[1.2] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm w-fit ${
                isActive ? "text-accent" : "text-text hover:text-accent"
              }`}
            >
              <span className="font-mono text-xs md:text-sm text-text-secondary tabular-nums">
                {String(i).padStart(2, "0")}
              </span>
              <span className="relative pb-2 md:pb-3">
                {link.label}
                <span aria-hidden="true" className="underline-arrow" />
              </span>
            </a>
          );
        })}
      </div>

      <div className="enter enter-2 absolute bottom-8 inset-x-0 px-6 md:px-10 flex items-center justify-center gap-6 text-sm text-text-secondary">
        <Magnetic strength={0.25} max={8}>
          <a
            href="https://www.linkedin.com/in/marzia-saidisoftwareengineer/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
          >
            LinkedIn
          </a>
        </Magnetic>
        <Magnetic strength={0.25} max={8}>
          <a
            href="mailto:marzia.saidi67@gmail.com"
            className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
          >
            Email
          </a>
        </Magnetic>
      </div>
    </div>
  );
}
