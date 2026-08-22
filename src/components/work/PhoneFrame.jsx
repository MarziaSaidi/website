// Sizing wrapper for mobile project previews — caps and centers a
// screenshot within the fixed preview panel it sits in (see ProjectRow),
// at its own natural size, never stretched. No bezel drawn here: the one
// screenshot that uses this (Survue's) already has a device frame baked
// into the image itself, so an outer CSS border would just double it.
export default function PhoneFrame({ children, className = "" }) {
  return <div className={`w-full max-w-[220px] max-h-full mx-auto ${className}`}>{children}</div>;
}
