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
    <div className="flex items-center gap-6 flex-wrap pt-2">
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
        className="group/link inline-flex items-center gap-3 pl-6 pr-5 py-3 md:pl-7 md:pr-6 md:py-3.5 rounded-full border border-border bg-background-secondary font-display text-sm md:text-base font-medium text-text transition-colors duration-300 hover:text-white hover:border-transparent hover:bg-[var(--world-accent,var(--color-accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze"
      >
        {primary.label}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="transition-transform duration-300 group-hover/link:translate-x-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </a>
      {secondary && (
        <a
          href={secondary.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-text-secondary hover:text-[var(--world-accent,var(--color-accent))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
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
            className="w-full h-auto block"
          />
        </PhoneFrame>
      );
    case "browser":
      // Wide desktop screenshots don't just shrink on small viewports — a
      // 16:10 dashboard scaled to phone width turns its own labels
      // illegible. Below sm, crop to a wider-than-source strip (object-fit
      // cover crops the *far* axis from the container's aspect ratio, so a
      // container wider than the 16:10 source crops height, not width —
      // keeping the full-width KPI band at the top in frame and trimming
      // the chart/table below it); at sm+ the image reverts to its natural
      // aspect ratio, shown in full.
      return (
        <BrowserChrome url={project.previewUrl}>
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
    <div className="flex flex-col gap-5 md:gap-6 max-w-lg">
      <OriginTag type={project.type} />
      <h3
        className="font-display font-semibold text-5xl md:text-7xl text-text leading-[1.05] tracking-[-0.01em]"
        style={isCaseStudyHref(project.href) ? { viewTransitionName: `project-title-${project.id}` } : undefined}
      >
        {project.name}
      </h3>
      <ProjectLabels labels={project.labels} />
      <p className="text-text-secondary text-lg leading-relaxed">{project.description}</p>
      <PrimaryProjectLink project={project} />
    </div>
  );
  // The artwork side: a soft tinted panel (not a bordered card) holding
  // the real preview, a faded offset echo of it behind for depth, and an
  // oversized numeral that bleeds past the panel's own edge rather than
  // just sitting behind the preview component — a composed corner, not a
  // screenshot floating in space.
  const preview = (
    <div className={`relative py-10 px-8 md:py-14 md:px-12 rounded-[2px] bg-[var(--world-accent,var(--color-accent))]/[0.07]`} data-cursor="view">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-6 md:inset-10 opacity-[0.35] blur-[1px]"
        style={{
          transform: `scale(0.94) translate(${reverse ? "10px" : "-10px"}, -8px) rotate(${reverse ? "1deg" : "-1deg"})`,
        }}
      >
        <ProjectPreview project={project} />
      </div>

      {/* No blend mode — a numeral that visually merges with whatever's
          beneath it reads as "behind the image," not "on top of it." Solid
          color, high in the stacking order, unambiguously on top. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none select-none absolute -bottom-8 md:-bottom-14 z-20 font-display font-bold text-[6.5rem] md:text-[11rem] leading-none text-[var(--world-accent,var(--color-accent))] drop-shadow-[0_2px_10px_rgba(0,0,0,0.12)] ${
          reverse ? "-right-3 md:-right-8" : "-left-3 md:-left-8"
        }`}
      >
        {index}
      </span>

      <div className="reveal-wipe relative z-10">
        <ProjectPreview project={project} />
      </div>
    </div>
  );

  // Desktop left/right placement is controlled independently of `reverse`
  // (which only drives mobile stacking order via DOM position below) —
  // order-1/order-2 here always place the two panes correctly regardless
  // of which one comes first in the markup.
  const previewOrder = imageLeft ? "md:order-1" : "md:order-2";
  const textOrder = imageLeft ? "md:order-2" : "md:order-1";

  return (
    <div ref={ref} data-world={project.world} className="reveal py-24 md:py-40">
      <div className="grid md:grid-cols-[1.15fr_1fr] gap-16 md:gap-28 items-center">
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
