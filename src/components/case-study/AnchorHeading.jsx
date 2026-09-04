// Just a heading with an id — the TOC and scrollToSection deep-links target
// this directly. No visible "#" glyph: aDrive prints one because it's a
// literal MDX blog renderer, but on a recruiter-facing case study that
// character reads as unrendered markup rather than a permalink affordance.
export default function AnchorHeading({ id, children, level = 2, className = "" }) {
  const Tag = `h${level}`;
  const sizing =
    level === 2
      ? "text-2xl md:text-[28px] mt-16 md:mt-20 mb-4"
      : "text-xl md:text-2xl mt-10 mb-3";

  return (
    <Tag id={id} className={`scroll-mt-28 font-display font-semibold tracking-tight leading-tight text-text ${sizing} ${className}`}>
      {children}
    </Tag>
  );
}
