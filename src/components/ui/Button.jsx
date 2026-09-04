// The site's one CTA component. Every call-to-action on the site renders
// through it — the hero button, the project-card CTAs, the "view all"
// link, the contact form's submit — so they all share a single hover
// choreography rather than each re-implementing a hover in its own file.
//
// The motion itself lives in index.css under BUTTON INTERACTION SYSTEM;
// this file is only responsible for emitting the layers that CSS drives:
//
//   .btn__sweep   the fill that passes through the button
//   .btn__track   the travelling cap
//   .btn__label   the label and the twin that replaces it
//   .btn__icon    the arrow and the twin that replaces it
//
// Both label copies carry the same text, so the hover twin is marked
// aria-hidden and the accessible name stays singular.

const ArrowRight = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const ArrowDown = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M6 13l6 6 6-6" />
  </svg>
);

const ArrowUpRight = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    aria-hidden="true"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M18 6H8M18 6V16" />
  </svg>
);

const ICONS = { right: ArrowRight, down: ArrowDown, external: ArrowUpRight };

export default function Button({
  as: Tag = "a",
  variant = "primary",
  icon = "right",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const Icon = icon ? ICONS[icon] : null;
  const quiet = variant === "quiet";

  // Height is set by min-h rather than padding alone so the control always
  // clears the 44px minimum touch target on a phone; the pill grows to a
  // roomier 52px from md up. --btn-cap is the resting width of the track
  // the cap rides in — cap inset + cap + cap inset, deliberately unrelated
  // to the pill's height so the cap sits just inside the left edge at
  // every size.
  const sizes = {
    sm: "min-h-11 text-sm [--btn-cap:2rem]",
    md: "min-h-11 md:min-h-[3.25rem] text-sm md:text-base [--btn-cap:2rem]",
  };

  // Left padding has to clear the resting cap (0.625rem inset + 0.75rem
  // cap = 1.375rem) with room to breathe, so the label starts beside the
  // cap rather than on top of it. The old button sized the cap off its own
  // height, which made it wider than the padding reserved for it.
  const base =
    "btn inline-flex items-center tracking-wide select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const variants = {
    primary: `${sizes[size]} gap-3 pl-9 pr-7 rounded-full font-display font-medium text-text`,
    secondary: `${sizes[size]} gap-3 pl-9 pr-7 rounded-full font-display font-medium text-button-secondary-text border border-button-secondary-border btn--secondary`,
    // min-h-11 gives the quiet variant the same 44px touch target as the
    // pills without inflating its visible height: the rule and the text sit
    // in an inner wrapper, so the extra height is pure hit area above and
    // below them rather than a gap between the label and its underline.
    quiet: "btn--quiet min-h-11 text-sm sm:text-base text-text-secondary",
  };

  const labelNode = (
    <span className="btn__label">
      <span className="btn__label-base">{children}</span>
      <span className="btn__label-hover" aria-hidden="true">
        {children}
      </span>
    </span>
  );

  const iconNode = Icon && (
    <span className="btn__icon" style={{ width: 16, height: 16 }}>
      <span className="btn__icon-base">
        <Icon />
      </span>
      <span className="btn__icon-hover" aria-hidden="true">
        <Icon />
      </span>
    </span>
  );

  return (
    <Tag className={`${base} ${variants[variant]} ${className}`} {...props}>
      {quiet ? (
        <span className="relative inline-flex items-center gap-2 pb-1.5">
          {labelNode}
          {iconNode}
          <span aria-hidden="true" className="btn__rule" />
        </span>
      ) : (
        <>
          <span aria-hidden="true" className="btn__sweep" />
          <span aria-hidden="true" className="btn__track">
            <span className="btn__cap" />
          </span>
          {labelNode}
          {iconNode}
        </>
      )}
    </Tag>
  );
}
