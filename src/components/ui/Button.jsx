export default function Button({
  as: Tag = "a",
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  // Focus ring sits in the offset gap (background color), so it needs
  // bronze (3.43:1) not gold (2.3:1) to clear the 3:1 UI-contrast minimum.
  const base =
    "hover-lift inline-flex items-center gap-2 px-7 py-3 text-sm tracking-wide rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const variants = {
    // Border sits directly on the dark accent surface — gold clears 3:1
    // there (bronze does not), so this one keeps gold intentionally.
    primary:
      "bg-accent text-background border-accent hover:border-gold",
    // Border sits on the light background — bronze clears 3:1 there.
    secondary:
      "bg-transparent text-text border-border hover:border-bronze hover:text-accent",
  };

  return (
    <Tag className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
