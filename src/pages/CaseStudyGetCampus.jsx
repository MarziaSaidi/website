import { useEffect, useState } from "react";
import AnchorHeading from "../components/case-study/AnchorHeading";
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
   card chrome — these exports are transparent-cornered laptop mockups with
   the device frame already baked in, so a border would just trace a
   rectangle around the empty margin outside the laptop. */
function Screenshot({ src, label, caption, onOpen }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="flex flex-col gap-3 w-full">
      {failed ? (
        <div className="w-full aspect-[16/10] border border-border bg-surface flex flex-col items-center justify-center gap-2 text-text-secondary px-2 text-center">
          <ImageIcon />
          <span className="font-mono text-[0.55rem] uppercase tracking-meta">{label}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={label}
          width={2880}
          height={1800}
          loading="lazy"
          onError={() => setFailed(true)}
          onClick={() => onOpen({ src, label })}
          className="w-full h-auto object-contain cursor-zoom-in opacity-100 hover:opacity-80 transition-opacity"
        />
      )}
      {caption && (
        <figcaption className="text-xs text-text-secondary text-center leading-relaxed max-w-[560px] mx-auto">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

const TOC_SECTIONS = [
  { id: "the-problem", label: "The Problem" },
  {
    id: "the-platform",
    label: "The Platform",
    children: [
      { id: "dashboard", label: "Dashboard" },
      { id: "applications", label: "Applications" },
      { id: "discover", label: "Discover" },
      { id: "billing", label: "Billing" },
    ],
  },
];

export default function CaseStudyGetCampus() {
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    scrollToHashedSectionOnLoad();
  }, []);
  useDocumentMeta(
    "Get Campus | Marzia Saidi",
    "Designing the employer side of a student gig marketplace: job posting, candidate discovery, applications, and billing, shipped as production ready Figma specs working directly with the founders and engineers."
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
            <Eyebrow className="enter enter-1">Case Study · Product Design (Internship)</Eyebrow>
            <h1 className="enter enter-2 font-display font-bold text-6xl md:text-7xl text-text leading-[1.02] mt-5 mb-2">
              Get Campus
            </h1>
            <p className="enter enter-3 font-mono text-sm text-text-secondary/60 tabular-nums mb-8">
              Jan–Apr 2026 · Startup Internship
            </p>
            <p className="enter enter-3 text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl">
              The employer side of a two sided student gig marketplace: job
              posting, candidate discovery, applications, and billing, shipped
              as build ready Figma specs.
            </p>

            <dl className="enter enter-5 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-8 mt-12 border-t border-border pt-10">
              {[
                ["Role", "Product Designer (Internship)"],
                ["Type", "Startup internship"],
                ["Platform", "Web · employer dashboard"],
                ["Focus", "Build ready specs, not mockups"],
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
              A two person founding team couldn't wait weeks for a polished
              mock. Every screen had to work as an actual spec — real states
              and edge cases, not just the happy path.
            </span>
          </p>
        </section>

        {/* THE PLATFORM */}
        <section id="the-platform" className="mx-auto px-6 md:px-10 py-[25px] max-w-5xl scroll-mt-28">
          <p className="text-lg leading-relaxed mb-16 max-w-[820px]">
            <span className="font-mono text-xs uppercase tracking-meta text-text-secondary mr-2">
              The Platform:
            </span>
            <span className="text-text-secondary">
              Four surfaces, one employer workflow: see your listings, review
              who applied, find who hasn't, pay who you hire.
            </span>
          </p>

          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-6">
              <AnchorHeading id="dashboard" level={3}>Dashboard</AnchorHeading>
              <Screenshot
                src="/get-campus/dashboard-overview.webp"
                label="Dashboard overview"
                onOpen={setLightboxImage}
                caption="Active jobs, pending applications, response rate, and time to hire, plus a trend chart and top performing jobs."
              />
            </div>

            <div className="flex flex-col gap-6">
              <AnchorHeading id="applications" level={3}>Applications</AnchorHeading>
              <Screenshot
                src="/get-campus/applications.webp"
                label="Manage applications"
                onOpen={setLightboxImage}
                caption="Status, experience, and match score for every candidate, filterable without opening each one."
              />
            </div>

            <div className="flex flex-col gap-6">
              <AnchorHeading id="discover" level={3}>Discover</AnchorHeading>
              <Screenshot
                src="/get-campus/discover.webp"
                label="Discover candidates"
                onOpen={setLightboxImage}
                caption="Search and filter the full candidate pool, then invite strong matches instead of waiting on inbound."
              />
            </div>

            <div className="flex flex-col gap-6">
              <AnchorHeading id="billing" level={3}>Billing</AnchorHeading>
              <Screenshot
                src="/get-campus/billing.webp"
                label="Billing & student payments"
                onOpen={setLightboxImage}
                caption="The employer's own plan, kept separate from the ledger of what they owe the students they hire."
              />
            </div>
          </div>

          <p className="text-text-secondary leading-relaxed max-w-[820px] mt-16">
            The habit that carried the whole project: design fast without
            designing loosely, so the spec and the shipped product never drift
            apart.
          </p>
        </section>

        <section className="mx-auto px-6 md:px-10 py-[25px] max-w-5xl">
          <div className="max-w-[820px]">
            <MetadataFooter
              fields={[
                ["Last Updated", "Feb 2026"],
                ["Read Time", "1 min"],
                ["Word Count", "220"],
              ]}
            />
          </div>
        </section>
      </main>

      <footer>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-14 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-text-secondary/80 font-mono uppercase tracking-meta">
            Case study · Get Campus · Marzia Saidi
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
