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

function Screenshot({ src, label, caption, width, height, onOpen }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="flex flex-col gap-3">
      {failed ? (
        <div className="w-full aspect-[16/10] bg-surface flex flex-col items-center justify-center gap-2 text-text-secondary px-4 text-center">
          <ImageIcon />
          <span className="font-mono text-[0.6rem] uppercase tracking-meta">{label}</span>
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
          className="w-full h-auto border-[0.5px] border-border cursor-zoom-in opacity-100 hover:opacity-80 transition-opacity"
        />
      )}
      {caption && (
        <figcaption className="text-sm text-text-secondary leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

const IMG_BASE = "/quill%20and%20pigeon";

const screens = [
  { n: "1", src: `${IMG_BASE}/1.png`, label: "Add Recipients", width: 2880, height: 1558, caption: "Add Recipients — manual entry or spreadsheet import, side by side." },
  { n: "2", src: `${IMG_BASE}/2.png`, label: "Upload CSV", width: 1338, height: 706, caption: "Drag-and-drop CSV or XLSX, no format wrestling." },
  { n: "3", src: `${IMG_BASE}/3.png`, label: "File staged", width: 1338, height: 492, caption: "File staged, ready to parse." },
  { n: "4", src: `${IMG_BASE}/4.png`, label: "Validation errors", width: 2042, height: 1190, caption: "Validation flags 15 duplicate and malformed rows before anything saves." },
  { n: "5", src: `${IMG_BASE}/5.png`, label: "Cleaned review", width: 2048, height: 722, caption: "Down to the 2 real contacts, ready to import." },
  { n: "6", src: `${IMG_BASE}/6.png`, label: "Import confirmed", width: 2040, height: 1008, caption: "Import confirmed, with exactly what was saved for each contact." },
  { n: "7", src: `${IMG_BASE}/7.png`, label: "Recipients populated", width: 2880, height: 1562, caption: "Recipients populate instantly — zero manual re-entry." },
];

const TOC_SECTIONS = [
  { id: "the-problem", label: "The Problem" },
  { id: "the-import", label: "The Import" },
];

export default function CaseStudyQuillPigeon() {
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    scrollToHashedSectionOnLoad();
  }, []);
  useDocumentMeta(
    "Quill & Pigeon | Marzia Saidi",
    "Building a CSV/XLSX bulk-import pipeline that validates and corrects recipient data, wiping out manual data entry for 100+ users."
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
            <Eyebrow className="enter enter-1">Case Study · Full Stack (Internship)</Eyebrow>
            <h1 className="enter enter-2 font-display font-bold text-6xl md:text-7xl text-text leading-[1.02] mt-5 mb-2">
              Quill &amp; Pigeon
            </h1>
            <p className="enter enter-3 font-mono text-sm text-text-secondary/60 tabular-nums mb-8">
              Jan – Aug 2025 · Portland, ME · Internship
            </p>
            <p className="enter enter-3 text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl">
              I built production features that eliminated manual work and
              gave the internal team live visibility into their own data.
            </p>

            <dl className="enter enter-5 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-8 mt-12 border-t border-border pt-10">
              {[
                ["Role", "Full Stack Developer (Intern)"],
                ["Type", "Internship"],
                ["Stack", "React · TypeScript · Zod · Google APIs"],
                ["Focus", "Removing manual work from internal workflows"],
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
              100+ users tracked recipients, addresses, and reminders by
              hand, with no bulk way in and no live view of their own data.
            </span>
          </p>
        </section>

        {/* THE IMPORT */}
        <section id="the-import" className="mx-auto px-6 md:px-10 py-[25px] max-w-5xl scroll-mt-28">
          <p className="text-lg leading-relaxed mb-16 max-w-[820px]">
            <span className="font-mono text-xs uppercase tracking-meta text-text-secondary mr-2">
              The Import:
            </span>
            <span className="text-text-secondary">
              One CSV upload, validated and corrected automatically, from
              raw file to populated recipient list.
            </span>
          </p>

          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-12">
            {screens.map((s) => (
              <Screenshot
                key={s.n}
                src={s.src}
                label={s.label}
                width={s.width}
                height={s.height}
                onOpen={setLightboxImage}
                caption={s.caption}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto px-6 md:px-10 py-[25px] max-w-5xl">
          <div className="max-w-[820px]">
            <MetadataFooter
              fields={[
                ["Last Updated", "Aug 2025"],
                ["Read Time", "1 min"],
                ["Word Count", "117"],
              ]}
            />
          </div>
        </section>
      </main>

      <footer>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-14 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-text-secondary/80 font-mono uppercase tracking-meta">
            Case study · Quill &amp; Pigeon · Marzia Saidi
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
