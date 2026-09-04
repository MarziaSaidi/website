import { useEffect } from "react";

// Full-screen viewer for a tapped screenshot — aDrive treats every image as
// inspectable evidence (cursor-zoom-in, click to enlarge) rather than a
// static illustration, which matters for a case study arguing that photo
// detail is what earns trust at a high price point.
export default function Lightbox({ image, onClose }) {
  useEffect(() => {
    if (!image) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 backdrop-blur-sm cursor-zoom-out px-6 py-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={image.label}
    >
      <img
        src={image.src}
        alt={image.label}
        className="max-h-full w-auto max-w-sm rounded-lg border border-white/10"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 md:top-8 md:right-8 text-white/70 hover:text-white transition-colors text-sm font-mono tracking-meta uppercase"
      >
        Close ✕
      </button>
    </div>
  );
}
