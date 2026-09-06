import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import Magnetic from "../ui/Magnetic";

gsap.registerPlugin(SplitText);

const LINKS = [
  { href: "#/", id: "home", label: "Home" },
  { href: "#/about", id: "about", label: "About" },
  { href: "#/contact", id: "contact", label: "Contact" },
];

// Full-screen nav overlay, opened from Navbar's single menu toggle at every
// breakpoint. Escape closes it and returns focus to the toggle button.
//
// The backdrop itself is solid the instant it mounts — it does NOT carry
// a fade. Animating opacity on the same element as bg-background meant the
// cream backdrop faded in over a page that's also cream-toned: for most of
// that second the backdrop was nearly invisible while the dark link text
// still read as fully legible, producing a "text with no background,
// bleeding into the page behind it" look on every page. So the backdrop
// stays instant and opaque; a separate `.menu-panel` (a soft tinted wash,
// not a blur — there's nothing but flat color behind it to blur) is what
// carries the entrance beat instead, fading in first the way the reference
// site's blurred panel leads its own link reveal.
//
// The link reveal itself is a GSAP timeline, not the plain `.enter`
// fade-up used elsewhere on the site: each label is split into characters
// with SplitText's `mask` option (every char gets wrapped in its own
// clipping window), the first letter drops in from behind its mask, and
// the remaining letters slide in from the side while their shared
// container grows from zero width — pushing the trailing divider mark out
// to the word's true end as it goes. Because the timeline stays mounted
// (not unmounted-and-rebuilt), closing just reverses it: the panel sits at
// position 0, so playing backwards drops the links out first and fades the
// panel out last, for free.
export default function MenuOverlay({ open, onClose, active, triggerRef }) {
  const [mounted, setMounted] = useState(open);
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const socialRef = useRef(null);
  const itemElsRef = useRef([]);
  const firstLinkRef = useRef(null);
  const tlRef = useRef(null);
  // Navbar passes a fresh `onClose` closure on every render (including the
  // very render triggered by calling it), so it can't sit in the effect
  // below's dependency array — that would tear down and rebuild the intro
  // timeline instead of reversing it the instant Escape or a link fires
  // onClose. Reading it through a ref keeps the effect keyed on `mounted`
  // alone while still always calling the latest onClose.
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  // Build + play the intro timeline once the overlay is actually in the DOM.
  useLayoutEffect(() => {
    if (!mounted) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const splits = [];

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
      });
      tlRef.current = tl;

      tl.to(panelRef.current, { opacity: 1, duration: reduceMotion ? 0.01 : 0.8 }, 0);

      itemElsRef.current.filter(Boolean).forEach((item, i) => {
        const indexEl = item.querySelector(".menu-item__index");
        const labelEl = item.querySelector(".menu-item__label-base");
        const dividerEl = item.querySelector(".menu-item__divider");

        const indexSplit = SplitText.create(indexEl, { type: "words", mask: "words" });
        const labelSplit = SplitText.create(labelEl, { type: "chars", mask: "chars" });
        splits.push(indexSplit, labelSplit);

        const [firstChar, ...restChars] = labelSplit.chars;
        const body = document.createElement("span");
        body.className = "menu-item__label-rest";
        restChars.forEach((charEl) => body.appendChild(charEl.parentNode));
        labelEl.appendChild(body);

        gsap.set(indexSplit.words, { yPercent: 120 });
        gsap.set(firstChar, { yPercent: 120 });
        gsap.set(restChars, { xPercent: 120 });
        gsap.set(body, { width: 0 });

        if (reduceMotion) {
          tl.set([indexSplit.words, firstChar, restChars], { yPercent: 0, xPercent: 0 }, 0)
            .set(body, { width: "auto" }, 0)
            .set(dividerEl, { scaleY: 1 }, 0);
          return;
        }

        const start = 0.5 + i * 0.15;
        tl.to(indexSplit.words, { yPercent: 0, duration: 0.7 }, start)
          .to(firstChar, { yPercent: 0, duration: 0.7 }, start)
          .to(dividerEl, { scaleY: 1, duration: 0.4 }, start + 0.1)
          .to(body, { width: () => body.scrollWidth, duration: 0.55 }, start)
          .to(restChars, { xPercent: 0, duration: 0.5, stagger: 0.025 }, start);
      });

      const socialStart = 0.5 + itemElsRef.current.length * 0.15;
      tl.to(
        socialRef.current,
        { opacity: 1, y: 0, duration: reduceMotion ? 0.01 : 0.6 },
        reduceMotion ? 0 : socialStart
      );

      tl.play();
    }, rootRef);

    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    const onKey = (e) => {
      if (e.key !== "Escape") return;
      onCloseRef.current();
      triggerRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      ctx.revert();
      splits.forEach((split) => split.revert());
    };
  }, [mounted, triggerRef]);

  // Closing reverses the same timeline instead of just unmounting, so the
  // links leave and the panel fades out before the overlay disappears.
  useEffect(() => {
    if (!mounted || open) return;
    const tl = tlRef.current;
    if (!tl) {
      setMounted(false);
      return;
    }
    tl.eventCallback("onReverseComplete", () => setMounted(false));
    tl.reverse();
    return () => tl.eventCallback("onReverseComplete", null);
  }, [open, mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      className="fixed inset-0 z-[90] bg-background"
    >
      <div className="relative max-w-6xl mx-auto px-6 md:px-10 h-full flex flex-col justify-center gap-4 md:gap-6">
        <div ref={panelRef} aria-hidden="true" className="menu-panel" />

        {LINKS.map((link, i) => {
          const isActive = active === link.id;
          return (
            <a
              key={link.href}
              ref={(el) => {
                itemElsRef.current[i] = el;
                if (i === 0) firstLinkRef.current = el;
              }}
              href={link.href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={`btn btn--quiet menu-item relative flex items-baseline gap-4 md:gap-6 font-serif text-4xl md:text-6xl leading-[1.2] [--btn-leading:1.3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm w-fit ${
                isActive ? "text-accent" : "text-text"
              }`}
            >
              <span className="menu-item__index font-mono text-xs md:text-sm text-text-secondary tabular-nums">
                {String(i).padStart(2, "0")}
              </span>
              <span className="relative pb-2 md:pb-3 inline-flex items-baseline">
                <span className="btn__label">
                  <span className="btn__label-base menu-item__label-base">{link.label}</span>
                  <span className="btn__label-hover" aria-hidden="true">
                    {link.label}
                  </span>
                </span>
                <span aria-hidden="true" className="menu-item__divider" />
                <span aria-hidden="true" className="btn__rule" />
              </span>
            </a>
          );
        })}
      </div>

      <div
        ref={socialRef}
        className="opacity-0 translate-y-4 absolute bottom-8 inset-x-0 px-6 md:px-10 flex items-center justify-center gap-6 text-sm text-text-secondary"
      >
        <Magnetic strength={0.25} max={8}>
          <a
            href="https://www.linkedin.com/in/marzia-saidisoftwareengineer/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center min-h-11 -my-2.5 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            LinkedIn
          </a>
        </Magnetic>
        <Magnetic strength={0.25} max={8}>
          <a
            href="mailto:marzia.saidi67@gmail.com"
            className="inline-flex items-center min-h-11 -my-2.5 hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            Email
          </a>
        </Magnetic>
      </div>
    </div>
  );
}
