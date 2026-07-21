export default function Button({
  as: Tag = "a",
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const base =
    "hover-lift inline-flex items-center gap-2 px-7 py-3 text-sm tracking-wide rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const variants = {
    primary:
      "bg-accent text-background border-accent hover:border-gold",
    secondary:
      "bg-transparent text-text border-border hover:border-gold hover:text-accent",
  };

  return (
    <Tag className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}
