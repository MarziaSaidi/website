import { useEffect, useState } from "react";
import TocSidebar from "../components/case-study/TocSidebar";
import Lightbox from "../components/case-study/Lightbox";
import MetadataFooter from "../components/case-study/MetadataFooter";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { scrollToHashedSectionOnLoad } from "../lib/scrollToSection";

/* ---- small building blocks ---- */

function Eyebrow({ children, className = "" }) {
  return (
    <p className={`font-mono text-[0.7rem] md:text-xs uppercase tracking-eyebrow text-text-secondary ${className}`}>
      {children}
    </p>
  );
}

function ImageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l5-5 4 4 3-3 4 4" />
    </svg>
  );
}

/* Real screenshot with graceful fallback: shows a labeled slot until the WEBP
   exists at `src`, then swaps to the real image automatically. No border or
   card chrome — the export already has its own device frame baked in, so
   adding one just traces a rectangle around the transparent margin. */
function Screenshot({ src, label, caption, width, height, onOpen }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="flex flex-col gap-3 w-full max-w-[118px] md:max-w-[150px] mx-auto">
      {failed ? (
        <div className="w-full aspect-[9/19] border border-border bg-surface flex flex-col items-center justify-center gap-2 text-text-secondary px-2 text-center">
          <ImageIcon />
          <span className="font-mono text-[0.55rem] uppercase tracking-meta">{label}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={label}
          width={width}
          height={height}
          loading="lazy"
          onError={() => setFailed(true)}
          onClick={() => onOpen({ src, label })}
          className="w-full h-auto object-contain cursor-zoom-in opacity-100 hover:opacity-80 transition-opacity"
        />
      )}
      {caption && (
        <figcaption className="text-xs text-text-secondary text-center leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

const TOC_SECTIONS = [
  { id: "the-problem", label: "The Problem" },
  { id: "the-app", label: "The App" },
];

export default function CaseStudySurvue() {
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    scrollToHashedSectionOnLoad();
  }, []);
  useDocumentMeta(
    "Survue | Marzia Saidi",
    "Leading UX for a cyclist safety app: designing calm, glanceable alerts a rider can trust while their eyes stay on the road."
  );

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <a
            href="#/"
            className="group inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Back to portfolio
          </a>
          <a href="#/" className="font-serif text-lg text-text tracking-wide">
            Marzia Saidi
          </a>
        </div>
      </header>

      <TocSidebar sections={TOC_SECTIONS} />

      <main>
        {/* HERO */}
        <section>
          <div className="max-w-5xl mx-auto px-6 md:px-10 pt-24 pb-[25px] md:pt-32">
            <Eyebrow className="enter enter-1">Case Study · Mobile UX Design</Eyebrow>
            <h1 className="enter enter-2 font-display font-bold text-6xl md:text-7xl text-text leading-[1.02] mt-5 mb-2">
              Survue
            </h1>
            <p className="enter enter-3 font-mono text-sm text-text-secondary/60 tabular-nums mb-8">
              Sept–Dec 2024 · Internship
            </p>
            <p className="enter enter-3 text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl">
              Leading UX for a cyclist safety app: designing calm, glanceable
              alerts a rider can trust while their eyes stay on the road.
            </p>

            <dl className="enter enter-4 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-8 mt-12 border-t border-border pt-10">
              {[
                ["Role", "Lead UX Designer & Mobile Dev"],
                ["Team", "3 engineers"],
                ["Platform", "iOS · Android · Windows"],
                ["Timeline", "Sep to Dec 2024"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1.5">
                  <dt className="font-mono text-[0.65rem] uppercase tracking-meta text-text-secondary">{k}</dt>
                  <dd className="text-sm text-text leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* PROBLEM — compact inline label, no separate heading/quote */}
        <section id="the-problem" className="mx-auto px-6 md:px-10 py-[25px] max-w-5xl scroll-mt-28">
          <p className="text-lg leading-relaxed max-w-[820px]">
            <span className="font-mono text-xs uppercase tracking-meta text-text-secondary mr-2">
              The Problem:
            </span>
            <span className="text-text-secondary">
              Riders have almost no awareness of what's behind them, and a
              warning only helps if it lands in a fraction of a second without
              pulling focus from the road. A safety alert that demands
              attention to read is a safety alert that fails.
            </span>
          </p>
        </section>

        {/* THE SCREENS */}
        <section id="the-app" className="mx-auto px-6 md:px-10 py-[25px] max-w-5xl scroll-mt-28">
          <p className="text-lg leading-relaxed mb-16 max-w-[820px]">
            <span className="font-mono text-xs uppercase tracking-meta text-text-secondary mr-2">
              The App:
            </span>
            <span className="text-text-secondary">
              Setup, live monitoring, and the alert itself, shipped with full
              parity across iOS, Android, and Windows, including a settings
              module I built in .NET MAUI.
            </span>
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-12 justify-items-center">
            <Screenshot
              src="/survue/pairing.webp"
              label="Device pairing"
              width={625}
              height={1278}
              onOpen={setLightboxImage}
              caption="Guided pairing: the device, its charge, and a single Connect action."
            />
            <Screenshot
              src="/survue/home-screen.webp"
              label="Ride monitoring"
              width={624}
              height={1277}
              onOpen={setLightboxImage}
              caption="The active ride view: live rear monitoring with a Gallery, Detection, Settings base."
            />
            <Screenshot
              src="/survue/ride-monitoring.webp"
              label="Vehicle detected"
              width={628}
              height={1278}
              onOpen={setLightboxImage}
              caption="Red road framing and one plain language risk level, readable in the quarter second a rider can spare."
            />
            <Screenshot
              src="/survue/recordings.webp"
              label="Automatic recordings"
              width={626}
              height={1277}
              onOpen={setLightboxImage}
              caption="Auto saved ride clips, timestamped, one tap to keep or delete."
            />
            <Screenshot
              src="/survue/settings.webp"
              label="Settings"
              width={625}
              height={1277}
              onOpen={setLightboxImage}
              caption="The settings module I built in .NET MAUI: theme, sound, warnings, help."
            />
          </div>
        </section>

        <section className="mx-auto px-6 md:px-10 py-[25px] max-w-5xl">
          <div className="max-w-[820px]">
            <MetadataFooter
              fields={[
                ["Last Updated", "Sept–Dec 2024"],
                ["Read Time", "1 min"],
                ["Word Count", "210"],
              ]}
            />
          </div>
        </section>
      </main>

      <footer>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-14 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-text-secondary/80 font-mono uppercase tracking-meta">
            Case study · Survue · Marzia Saidi
          </p>
          <a
            href="#/"
            className="link-dotted text-sm text-text-secondary hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            Back to portfolio
          </a>
        </div>
      </footer>

      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </div>
  );
}
