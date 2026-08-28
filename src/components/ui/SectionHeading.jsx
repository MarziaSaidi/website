import { useScrollReveal } from "../../hooks/useScrollReveal";

export default function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  headingId,
  align = "left",
  className = "",
}) {
  const ref = useScrollReveal();
  const alignClass = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";

  return (
    <div ref={ref} className={`reveal flex flex-col gap-6 max-w-xl ${alignClass} ${className}`}>
      <div className="flex items-center gap-3 border-t border-border pt-6 w-full">
        <span className="font-serif text-sm text-label tabular-nums" aria-hidden="true">
          {index}
        </span>
        <span className="block h-px w-6 bg-gold divider-draw" aria-hidden="true" />
        <p className="text-xs tracking-eyebrow uppercase text-text-secondary">
          {eyebrow}
        </p>
      </div>
      <h2 id={headingId} className="text-4xl md:text-5xl text-text leading-[1.1]">{title}</h2>
      {description && (
        <p className="text-text-secondary leading-relaxed">{description}</p>
      )}
    </div>
  );
}
