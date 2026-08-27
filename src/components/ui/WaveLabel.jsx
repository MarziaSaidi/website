// Splits text into per-letter spans so Button's "link" variant can ripple
// them in a staggered wave on hover/focus (see .wave-letter in index.css).
// The real text stays the accessible name; the letters themselves are
// aria-hidden, mirroring ScrambleText's decorative-vs-accessible split.
export default function WaveLabel({ text }) {
  return (
    <span aria-label={text}>
      <span aria-hidden="true">
        {text.split("").map((ch, i) => (
          <span key={i} className="wave-letter" style={{ "--i": i }}>
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
    </span>
  );
}
