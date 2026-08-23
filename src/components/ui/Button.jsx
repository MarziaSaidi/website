export default function Button({
  as: Tag = "a",
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  // Focus ring sits in the offset gap (background color), so it needs
  // bronze (3.43:1) not gold (2.3:1) to clear the 3:1 UI-contrast minimum.
  // Vertical padding, text size, and rounded-full match the project
  // cards' CTA pill (see PrimaryProjectLink in ProjectRow.jsx) exactly —
  // same height and corner radius at every breakpoint — but horizontal
  // padding is this component's own and deliberately NOT matched, so
  // width still tracks each button's own label ("View all works" vs.
  // "Send Message") instead of being forced to one fixed size.
  const base =
    "hover-lift active:scale-[0.97] group/btn relative overflow-hidden inline-flex items-center gap-2 px-8 py-1.5 sm:py-3 md:py-3.5 text-xs sm:text-sm md:text-base tracking-wide rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const variants = {
    // Same growing-circle sweep as the project cards' CTA pill: a quiet
    // stone dot at rest, clipped by overflow-hidden to this button's own
    // rounded-full shape, that grows into a solid button-primary-bg fill
    // on hover — rather than a static solid surface that just swaps
    // color. Sized off the Tag itself (h-full), so this only lines up
    // with the label when the button hugs its own content width — every
    // primary Button is, on purpose (see the self-start on Contact's
    // "Send Message" call site; a stretched, centered button left the
    // circle stranded away from the text it's meant to sit behind).
    primary: "text-text transition-colors duration-500 hover:text-button-primary-text",
    secondary:
      "bg-transparent text-button-secondary-text border border-button-secondary-border hover:bg-button-secondary-hover-bg",
  };

  return (
    <Tag className={`${base} ${variants[variant]} ${className}`} {...props}>
      {variant === "primary" && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 h-full aspect-square rounded-full bg-button-secondary-border origin-left scale-100 transition-[transform,background-color] duration-500 ease-out group-hover/btn:scale-[6] group-hover/btn:bg-button-primary-bg"
        />
      )}
      <span className="relative z-10">{children}</span>
    </Tag>
  );
}
