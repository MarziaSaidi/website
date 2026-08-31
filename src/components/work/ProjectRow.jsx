import { useScrollReveal } from "../../hooks/useScrollReveal";
import Button from "../ui/Button";
import Magnetic from "../ui/Magnetic";
import BrowserChrome from "./BrowserChrome";
import PhoneFrame from "./PhoneFrame";
import ChatPreview from "./ChatPreview";
import ValidatorPreview from "./ValidatorPreview";

// Shared between Selected Work's flagship rows and Home's featured-project
// preview, so both stay visually identical rather than drifting apart —
// same numeral treatment, same preview dispatch, same link styling.

export function ProjectLabels({ labels, className = "" }) {
  return (
    <p className={`font-mono text-[0.65rem] uppercase tracking-meta text-label ${className}`}>
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
      className={`font-mono text-[0.65rem] tracking-meta uppercase ${
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
  return (
    <div className="flex items-center gap-5 pt-1 flex-wrap">
      {project.href && (
        <a
          href={project.href}
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

// The project's primary link, plus a small plain-text link for whichever
// second link exists — one dominant call to action, not two competing
// ones. The pill itself is the shared Button component, so a project card
// CTA and the hero CTA play the exact same hover choreography instead of
// each maintaining its own copy of the markup (they had already drifted:
// this one's cap sizing and padding differed from Button's).
function PrimaryProjectLink({ project }) {
  if (!project.href && !project.live) return null;

  const primary = project.href
    ? { href: project.href, label: project.hrefLabel, external: false }
    : { href: project.live, label: project.liveLabel, external: true };
  const secondary = project.href && project.live ? { href: project.live, label: project.liveLabel } : null;

  return (
    <div className="mt-auto flex items-center gap-3 sm:gap-6 flex-wrap pt-1 sm:pt-2">
      {/* Wrapped in Magnetic to match the hero CTA exactly: same Button,
          same variant and size, and now the same pointer response — the
          pill drifts toward the cursor before the hover choreography
          starts. Without this the two buttons looked identical at rest but
          behaved differently the moment you approached them. */}
      <Magnetic>
        <Button
          href={primary.href}
          variant="primary"
          // Down arrow, matching the hero CTA — on this site a down arrow
          // is the "go see more" marker rather than a literal scroll cue
          // (the hero's own "View all works ↓" navigates to another page
          // too). An external primary link keeps the ↗ glyph, since there
          // it carries real information: the link leaves the site.
          icon={primary.external ? "external" : "down"}
          target={primary.external ? "_blank" : undefined}
          rel={primary.external ? "noopener noreferrer" : undefined}
        >
          {primary.label}
        </Button>
      </Magnetic>
      {secondary && (
        <a
          href={secondary.href}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center min-h-11 -my-2.5 text-sm text-text-secondary hover:text-[var(--world-accent,var(--color-accent))] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
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
      // The preview box is full width below md and a fixed size from md up
      // (see ProjectRow) — either way, the screenshot sits at its own
      // natural width-driven size (never stretched, never cropped) with a
      // max-height safety net so it only ever shrinks, never overflows.
      return (
        <BrowserChrome url={project.previewUrl} className="max-w-full max-h-full">
          <img
            src={project.previewSrc}
            alt={project.previewAlt}
            width={project.previewWidth}
            height={project.previewHeight}
            loading="lazy"
            className="w-full h-auto object-contain block"
          />
        </BrowserChrome>
      );
    case "poster":
      // For a preview image that's already a composed piece of art (e.g. a
      // multi-screen showcase collage) rather than a single literal screen —
      // no browser or phone chrome, since neither metaphor applies. Framed
      // the same way BrowserChrome's outer shell is (border, rounded, soft
      // shadow) so it still reads as one of this row's "real interface"
      // previews, just without the traffic-light bar on top.
      return (
        <div className="rounded-xl border border-border bg-paper shadow-soft overflow-hidden max-w-full max-h-full">
          <img
            src={project.previewSrc}
            alt={project.previewAlt}
            width={project.previewWidth}
            height={project.previewHeight}
            loading="lazy"
            className="w-full h-auto object-contain block"
          />
        </div>
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
  // ProjectPreview returns null for `preview: "none"` (Wildwood), which left
  // the tinted panel rendering as an empty box with a numeral floating in
  // it. Those rows get a text-only composition instead — see below.
  const hasPreview = Boolean(project.preview) && project.preview !== "none";
  const text = (
    <div className="h-full flex flex-col gap-3 sm:gap-6 md:gap-8 max-w-lg">
      <OriginTag type={project.type} />
      {/* Steps down from the old md:text-7xl (72px). At 72px the project
          title was LARGER and heavier than the section heading introducing
          it ("A few things I've designed and built", Cormorant 60px/500) —
          an inverted hierarchy where the subordinate element outweighed its
          own section. 48px semibold Space Grotesk still dominates the row
          against the 18px description, but now sits clearly beneath the
          section heading. */}
      <h3 className="font-display font-semibold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-text leading-[1.1] md:leading-[1.05] tracking-[-0.01em]">
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
  //
  // Sized by aspect ratio rather than a hard 450x520. The fixed width was
  // wider than its own grid track at the md breakpoint (a 450px box in a
  // ~268px column), which forced the track open and squeezed the text
  // column beside it. max-w + aspect keeps the exact same 450x520 frame
  // from xl up, shrinks proportionally at md/lg instead of overflowing,
  // and still goes full width (auto height, from the preview's own
  // content) below md, so every screenshot renders at its natural,
  // uncropped, actually-readable size on a phone.
  //
  // ml-auto when the preview sits on the right keeps the panel flush with
  // the row's outer edge once its track is wider than the 450px cap, so
  // both alternating orientations line up on the same outer margins.
  //
  // The numeral bleeds well past the box's own edge — it needs to sit
  // OUTSIDE the clipped area, not just visually overlap it, so overflow
  // lives on an inner wrapper (the tinted panel + its content) while the
  // numeral is a direct child of the unclipped outer box.
  const preview = (
    <div
      className={`group relative w-full md:max-w-[450px] md:aspect-[45/52] ${imageLeft ? "" : "md:ml-auto"}`}
      data-cursor="view"
    >
      <div className="relative md:absolute md:inset-0 p-4 md:p-14 rounded-[2px] bg-[var(--world-accent,var(--color-accent))]/[0.07] overflow-hidden">
        {/* The echo reads as a soft depth shadow for a rectangular
            screenshot, but a phone preview is mostly dark UI on a
            transparent bezel — blurred and offset, that just smears into
            an unwanted dark shape behind it. Skip it for that one case. */}
        {project.preview !== "device" && (
          <div
            aria-hidden="true"
            // `inert` as well as aria-hidden: this layer re-renders the whole
            // preview component, and SupportIQ's is a genuinely interactive
            // demo, so the echo contained a second, invisible copy of its
            // follow-up button. aria-hidden does not remove anything from the
            // tab order, so that duplicate was still reachable by keyboard —
            // a focusable control inside an aria-hidden subtree, which is
            // both an ARIA violation and a dead tab stop on a blurred shadow.
            inert
            className="pointer-events-none absolute inset-4 md:inset-14 opacity-[0.35] blur-[1px] flex items-center justify-center"
            style={{
              transform: `scale(0.94) translate(${reverse ? "10px" : "-10px"}, -8px) rotate(${reverse ? "1deg" : "-1deg"})`,
            }}
          >
            <ProjectPreview project={project} />
          </div>
        )}

        {/* Controlled zoom on hover — scales this wrapper, never the
            image/UI itself, so nothing distorts; clipped by the panel's
            own overflow-hidden above. */}
        <div className="reveal-wipe relative z-10 w-full h-full flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
          <ProjectPreview project={project} />
        </div>
      </div>

      {/* Bleeds past the panel's own edge, unclipped — a numeral standing
          outside the frame, with real drop-shadow depth, rather than a
          watermark sitting flush behind the image. Nudges on hover too,
          but far less than the image itself — a supporting element,
          not the thing being looked at. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none select-none absolute -bottom-3 sm:-bottom-6 md:-bottom-16 z-20 font-display font-bold text-4xl sm:text-6xl md:text-[11rem] leading-none text-[var(--world-accent,var(--color-accent))] drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 ${
          reverse ? "-right-3 sm:-right-5 md:-right-14" : "-left-3 sm:-left-5 md:-left-14"
        }`}
      >
        {index}
      </span>
    </div>
  );

  // Below md, the preview always comes first and text follows — a plain
  // top-to-bottom read, regardless of `reverse`. `reverse` still flavors
  // the preview's own internal styling (echo tilt direction, which corner
  // the numeral bleeds into), just not which one is on top on a phone.
  // From md up, order-1/order-2 alternate which side the preview sits on
  // as before; items-end there keeps the panel's own bottom edge pinned to
  // the row's bottom so "View project" (pushed down via mt-auto on the
  // text side) lines up with it exactly, not just when the panel happens
  // to be the taller column.
  const previewOrder = `order-1 md:flex md:items-end ${imageLeft ? "md:order-1" : "md:order-2"}`;
  const textOrder = `order-2 ${imageLeft ? "md:order-2" : "md:order-1"}`;

  // Text-only row: the description takes a comfortable reading measure
  // rather than stretching the full container, and the numeral becomes a
  // quiet marker in the facing column instead of a label on an empty panel.
  if (!hasPreview) {
    return (
      <div ref={ref} data-world={project.world} className="reveal py-16 sm:py-28 md:py-44 lg:py-52">
        <div className="flex items-start justify-between gap-10">
          {text}
          <span
            aria-hidden="true"
            className="pointer-events-none select-none shrink-0 font-display font-bold text-4xl sm:text-6xl md:text-[7rem] leading-none text-[var(--world-accent,var(--color-accent))]/25"
          >
            {index}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} data-world={project.world} className="reveal py-16 sm:py-28 md:py-44 lg:py-52">
      {/* Symmetric columns. The old [1.15fr_1fr] template was fixed while
          the content alternated sides via `order`, so the wide track landed
          on the preview in one row and on the text in the next: the
          description measure swung between 439px and 494px row to row, and
          the inner gutter between 128px and 183px, for no reason a reader
          could perceive as intentional. Equal tracks make every row
          identical in measure and gutter, whichever side the preview is on.
          The gap also steps up gradually now instead of jumping straight to
          112px at md, where it was consuming 16% of a tablet's width. */}
      <div className="flex flex-col gap-8 sm:gap-10 md:grid md:grid-cols-2 md:gap-12 lg:gap-24 xl:gap-32 md:items-stretch">
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
