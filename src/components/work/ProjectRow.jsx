import PhoneFrame from "./PhoneFrame";
import ChatPreview from "./ChatPreview";
import ValidatorPreview from "./ValidatorPreview";

// Shared between the Home featured-work cards (ProjectCardFrame /
// HaoqiProjectCard) for the origin tag and the real-preview dispatch —
// there's no separate Selected Work page anymore, so this file is just
// those two pieces now, not a full flagship-row component.

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

// `boxed` swaps the bracket-text treatment above for a filled tag (solid
// background, no brackets) — the haoqi.design-style corner label used on
// QalinPaperCard. Kept as a variant of the same component rather than a
// separate one since it's the same piece of information in the same slot,
// just a different render.
export function OriginTag({ type, className = "", color, boxed = false }) {
  const label = ORIGIN_LABELS[type];
  if (!label) return null;
  const isSolo = type !== "internship";

  if (boxed) {
    return (
      <span
        className={`font-mono text-[0.65rem] tracking-meta uppercase px-2.5 py-1 text-white ${className}`}
        style={{ background: color || "var(--world-accent, var(--color-accent))" }}
      >
        {label}
      </span>
    );
  }

  return (
    <p
      className={`font-mono text-[0.65rem] tracking-meta uppercase ${
        // Inline `color` (when passed) wins over either of these regardless
        // of stylesheet order, so a caller can override without fighting
        // specificity.
        isSolo ? "text-[var(--world-accent,var(--color-accent))]" : "text-text-secondary"
      } ${className}`}
      style={color ? { color } : undefined}
    >
      [ {label} ]
    </p>
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
      // The screenshot sits at its own natural width-driven size (never
      // stretched, never cropped) with a max-height safety net so it only
      // ever shrinks, never overflows. No browser-chrome wrapper — just
      // the raw screenshot, same as "device" skips a phone frame when the
      // image already has one baked in.
      return (
        <img
          src={project.previewSrc}
          alt={project.previewAlt}
          width={project.previewWidth}
          height={project.previewHeight}
          loading="lazy"
          className="w-full h-auto object-contain block max-w-full max-h-full"
        />
      );
    case "poster":
      // For a preview image that's already a composed piece of art (e.g. a
      // multi-screen showcase collage) rather than a single literal screen —
      // no browser or phone chrome, since neither metaphor applies. Just a
      // bordered, rounded frame (border, rounded, soft shadow) so it still
      // reads as one of this row's "real interface" previews.
      return (
        <div className="rounded-xl border border-border bg-surface-elevated shadow-soft overflow-hidden max-w-full max-h-full">
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
