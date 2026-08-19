// Minimal phone bezel for mobile project previews — same visual language
// as the .NET MAUI settings simulator's device frame, extracted so it can
// wrap a static screenshot too.
export default function PhoneFrame({ children, className = "" }) {
  return (
    <div className={`w-full max-w-[220px] mx-auto rounded-[2rem] border border-border bg-paper p-3 shadow-soft ${className}`}>
      <div className="rounded-[1.5rem] overflow-hidden">{children}</div>
    </div>
  );
}
