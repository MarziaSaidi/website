import { useScrollReveal } from "../../hooks/useScrollReveal";
import { navigateWithTransition } from "../../utils/viewTransition";
import BrowserChrome from "./BrowserChrome";
import PhoneFrame from "./PhoneFrame";
import ChatPreview from "./ChatPreview";
import ValidatorPreview from "./ValidatorPreview";

// Shared between Selected Work's flagship rows and Home's featured-project
// preview, so both stay visually identical rather than drifting apart —
// same numeral treatment, same preview dispatch, same link styling.

// Case-study links get a real view transition instead of a hard cut; the
// project's title carries a matching viewTransitionName so it morphs into
// the case-study hero (see the "Back to portfolio" link on those pages).
export function isCaseStudyHref(href) {
  return typeof href === "string" && href.startsWith("#/");
}

export function ProjectLabels({ labels, className = "" }) {
  return (
    <p className={`font-mono text-[0.65rem] uppercase tracking-[0.14em] text-label ${className}`}>
      {labels.join("  ·  ")}
    </p>
  );
}

// Reuses the site's existing bracket-tag motif (HeroObject's "[ 98% ]",
// the footer/status-bar's mono system readouts) rather than inventing a
// new badge style — so at a glance across the whole list, a colored
// bracket means "built alone" (and whether that meant coding it or just
// designing it), a quiet one means "built on a team."
const ORIGIN_LABELS = {
  "solo-build": "Solo build",
  "solo-design": "Solo design",
  internship: "Internship",
};

function OriginTag({ type }) {
  const label = ORIGIN_LABELS[type];
  if (!label) return null;
  const isSolo = type !== "internship";
  return (
    <p
      className={`font-mono text-[0.65rem] tracking-[0.14em] uppercase ${
        isSolo ? "text-[var(--world-accent,var(--color-accent))]" : "text-text-secondary"
      }`}
    >
      [ {label} ]
    </p>
  );
}

// Legacy inline-link pair — still used by Tier2Card/Tier3Card, which keep
// the smaller text-link treatment. ProjectRow below uses PrimaryProjectLink
// instead for its single big pill CTA.
export function ProjectLinks({ project }) {
  if (!project.href && !project.live) return null;
  const isCaseStudy = isCaseStudyHref(project.href);
  return (
    <div className="flex items-center gap-5 pt-1 flex-wrap">
      {project.href && (
        <a
          href={project.href}
          onClick={
            isCaseStudy
              ? (e) => {
                  e.preventDefault();
                  navigateWithTransition(project.href);
                }
              : undefined
          }
          className="world-link group/link inline-flex items-center gap-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
        >
          {project.hrefLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" className="transition-transform duration-300 group-hover/link:translate-x-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      )}
      {project.live && (
        <a
          href={project.live}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-2 text-sm text-text-secondary hover:text-[var(--world-accent,var(--color-accent))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
        >
          {project.liveLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M18 6H8M18 6V16" />
          </svg>
        </a>
      )}
    </div>
  );
}

// One big rounded pill for the project's primary link (case study takes
// priority over an external live link), plus a small plain-text link for
// whichever second link exists — one dominant call to action, not two
// competing ones.
function PrimaryProjectLink({ project }) {
  if (!project.href && !project.live) return null;

  const primary = project.href
    ? { href: project.href, label: project.hrefLabel, isCaseStudy: true, external: false }
    : { href: project.live, label: project.liveLabel, isCaseStudy: false, external: true };
  const secondary = project.href && project.live ? { href: project.live, label: project.liveLabel } : null;

  return (
    <div className="mt-auto flex items-center gap-3 sm:gap-6 flex-wrap pt-1 sm:pt-2">
      <a
        href={primary.href}
        target={primary.external ? "_blank" : undefined}
        rel={primary.external ? "noopener noreferrer" : undefined}
        onClick={
          primary.isCaseStudy
            ? (e) => {
                e.preventDefault();
                navigateWithTransition(primary.href);
              }
            : undefined
        }
        className="group/link relative overflow-hidden inline-flex items-center gap-2 sm:gap-3 pl-3.5 pr-3 py-1.5 sm:pl-6 sm:pr-5 sm:py-3 md:pl-7 md:pr-6 md:py-3.5 rounded-full font-display text-xs sm:text-sm md:text-base font-medium text-text transition-colors duration-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze"
      >
        {/* Sits behind the label as a small circle the same size as the
            pill's own rounded end — reads as a modest accent at rest, not
            a filled button. Scaling it up from that left-anchored point
            (rather than animating the container's own background) is what
            makes it sweep across as one continuous fill instead of a flat
            cross-fade, and the pill's overflow-hidden keeps it clipped to
            the capsule shape the whole way through. */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 h-full aspect-square rounded-full bg-[var(--world-accent,var(--color-accent))] origin-left scale-100 transition-transform duration-500 ease-out group-hover/link:scale-[6]"
        />
        <span className="relative z-10">{primary.label}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="relative z-10 shrink-0 sm:w-[18px] sm:h-[18px] transition-transform duration-300 group-hover/link:translate-x-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>
      {secondary && (
        <a
          href={secondary.href}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline text-sm text-text-secondary hover:text-[var(--world-accent,var(--color-accent))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
        >
          {secondary.label}
        </a>
      )}
    </div>
  );
}

// Dispatches to the right presentation for what the project actually is —
// a live chat surface, a real device screenshot, a real browser screenshot,
// or real validator output — never a generic stock image.
export function ProjectPreview({ project }) {
  switch (project.preview) {
    case "chat":
      return <ChatPreview />;
    case "validator":
      return <ValidatorPreview />;
    case "device":
      return (
        <PhoneFrame>
          <img
            src={project.previewSrc}
            alt={project.previewAlt}
            width={project.previewWidth}
            height={project.previewHeight}
            loading="lazy"
            className="w-full h-auto max-h-full object-contain block"
          />
        </PhoneFrame>
      );
    case "browser":
      // The preview box is now a fixed size (see ProjectRow). The
      // screenshot sits at its own natural width-driven size (never
      // stretched to fill the box) with a max-height safety net so it
      // only ever shrinks, never overflows.
      return (
        <BrowserChrome url={project.previewUrl} className="max-w-full max-h-full">
          <div className="aspect-[16/9] sm:aspect-auto overflow-hidden">
            <img
              src={project.previewSrc}
              alt={project.previewAlt}
              width={project.previewWidth}
              height={project.previewHeight}
              loading="lazy"
              className="w-full h-full object-cover object-top sm:h-auto sm:object-contain block"
            />
          </div>
        </BrowserChrome>
      );
    default:
      return null;
  }
}

// The flagship row: full-width, preview and text side by side, alternating
// which side the preview sits on, with a large index numeral layered
// behind the preview's corner — a graphic marker for the row rather than a
// small inline numeral next to the category label. Generously spaced, no
// divider rule between rows — separation comes from whitespace alone.
export function ProjectRow({ project, index, reverse, imageLeft = !reverse }) {
  const ref = useScrollReveal();
  const text = (
    <div className="h-full flex flex-col gap-3 sm:gap-6 md:gap-8 max-w-lg">
      <OriginTag type={project.type} />
      <h3
        className="font-display font-semibold text-2xl sm:text-4xl md:text-7xl text-text leading-[1.1] md:leading-[1.05] tracking-[-0.01em]"
        style={isCaseStudyHref(project.href) ? { viewTransitionName: `project-title-${project.id}` } : undefined}
      >
        {project.name}
      </h3>
      <ProjectLabels labels={project.labels} />
      <p className="text-text-secondary text-sm sm:text-base md:text-lg leading-relaxed">{project.description}</p>
      <PrimaryProjectLink project={project} />
    </div>
  );
  // The artwork side: a soft tinted panel (not a bordered card) holding
  // the real preview, a faded offset echo of it behind for depth, and an
  // oversized numeral that bleeds past the panel's own edge rather than
  // just sitting behind the preview component — a composed corner, not a
  // screenshot floating in space.
  // Fixed size across every project, at every breakpoint — 160x350 on
  // mobile, 450x520 from md up. The preview's job is to shrink to fit
  // that box (see ProjectPreview's object-contain sizing), not the other
  // way around, so every row reads as the same "frame" regardless of
  // what real screenshot or UI happens to be inside it.
  //
  // The numeral bleeds well past the box's own edge — it needs to sit
  // OUTSIDE the clipped area, not just visually overlap it, so overflow
  // lives on an inner wrapper (the tinted panel + its content) while the
  // numeral is a direct child of the unclipped outer box.
  const preview = (
    <div className="relative w-[160px] h-[350px] md:w-[450px] md:h-[520px]" data-cursor="view">
      <div className="absolute inset-0 p-4 md:p-14 rounded-[2px] bg-[var(--world-accent,var(--color-accent))]/[0.07] overflow-hidden">
        {/* The echo reads as a soft depth shadow for a rectangular
            screenshot, but a phone preview is mostly dark UI on a
            transparent bezel — blurred and offset, that just smears into
            an unwanted dark shape behind it. Skip it for that one case. */}
        {project.preview !== "device" && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-4 md:inset-14 opacity-[0.35] blur-[1px] flex items-center justify-center"
            style={{
              transform: `scale(0.94) translate(${reverse ? "10px" : "-10px"}, -8px) rotate(${reverse ? "1deg" : "-1deg"})`,
            }}
          >
            <ProjectPreview project={project} />
          </div>
        )}

        <div className="reveal-wipe relative z-10 w-full h-full flex items-center justify-center">
          <ProjectPreview project={project} />
        </div>
      </div>

      {/* Bleeds past the panel's own edge, unclipped — a numeral standing
          outside the frame, with real drop-shadow depth, rather than a
          watermark sitting flush behind the image. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none select-none absolute -bottom-3 sm:-bottom-6 md:-bottom-16 z-20 font-display font-bold text-4xl sm:text-6xl md:text-[11rem] leading-none text-[var(--world-accent,var(--color-accent))] drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)] ${
          reverse ? "-right-3 sm:-right-5 md:-right-14" : "-left-3 sm:-left-5 md:-left-14"
        }`}
      >
        {index}
      </span>
    </div>
  );

  // Left/right placement is controlled independently of `reverse` (which
  // only flavors the preview's own internal styling — echo tilt direction,
  // which corner the numeral bleeds into) — order-1/order-2 here always
  // place the two panes correctly regardless of which one comes first in
  // the markup, and apply at every breakpoint now that mobile is a row
  // (image beside text) rather than a stack (image above text).
  // Both columns stretch to the row's height (items-stretch below), which
  // whichever column has the taller natural content — usually the fixed-
  // size preview panel, but on mobile a long description can out-grow it.
  // items-end here keeps the panel's own bottom edge pinned to the row's
  // bottom in either case, so "View project" (pushed down via mt-auto on
  // the text side) always lines up with the panel's bottom edge exactly,
  // not just when the panel happens to be the taller column.
  const previewOrder = imageLeft ? "order-1 flex items-end" : "order-2 flex items-end";
  const textOrder = imageLeft ? "order-2" : "order-1";

  return (
    <div ref={ref} data-world={project.world} className="reveal py-16 sm:py-28 md:py-44 lg:py-52">
      {/* Below md, the preview stays a compact side column instead of a
          full-width block stacked above the text — an image, name, and
          description read as one row even on a phone, not a scroll of
          separate stacked chunks. */}
      <div className="grid grid-cols-[0.8fr_1fr] gap-4 sm:gap-8 md:grid-cols-[1.15fr_1fr] md:gap-28 lg:gap-32 items-stretch">
        {reverse ? (
          <>
            <div className={previewOrder}>{preview}</div>
            <div className={textOrder}>{text}</div>
          </>
        ) : (
          <>
            <div className={textOrder}>{text}</div>
            <div className={previewOrder}>{preview}</div>
          </>
        )}
      </div>
    </div>
  );
}
