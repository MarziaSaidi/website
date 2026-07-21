import { useScrollReveal } from "../../hooks/useScrollReveal";

export default function Reveal({
  as: Tag = "div",
  className = "",
  delay,
  children,
  ...props
}) {
  const ref = useScrollReveal();

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...props}
    >
      {children}
    </Tag>
  );
}
