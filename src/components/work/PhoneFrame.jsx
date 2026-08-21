// Minimal phone bezel for mobile project previews — same visual language
// as the .NET MAUI settings simulator's device frame, extracted so it can
// wrap a static screenshot too. Sits at its own natural, capped size
// (never stretched to fill the fixed preview panel it's centered in —
// see ProjectRow) with a max-height safety net for the rare case where
// that natural size would still be taller than the panel allows. No fill
// on the bezel itself — the tinted panel behind it shows through the
// border, instead of a stark white frame around a dark screenshot.
export default function PhoneFrame({ children, className = "" }) {
  return (
    <div className={`w-full max-w-[220px] max-h-full mx-auto rounded-[2rem] border border-border p-3 shadow-soft ${className}`}>
      <div className="rounded-[1.5rem] overflow-hidden">{children}</div>
    </div>
  );
}
