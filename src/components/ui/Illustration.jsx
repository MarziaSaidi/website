import { useScrollReveal } from "../../hooks/useScrollReveal";

export default function Illustration({
  src,
  alt = "",
  decorative = true,
  className = "",
  imgClassName = "",
}) {
  const ref = useScrollReveal();

  return (
    <div ref={ref} className={`reveal-media illustration-hover ${className}`}>
      <img
        src={src}
        alt={decorative ? "" : alt}
        aria-hidden={decorative ? "true" : undefined}
        loading="lazy"
        className={`w-full h-auto select-none ${imgClassName}`}
        draggable={false}
      />
    </div>
  );
}
