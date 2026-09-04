import { useEffect } from "react";
import MetadataFooter from "../components/case-study/MetadataFooter";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

function Eyebrow({ children, className = "" }) {
  return (
    <p className={`font-mono text-[0.7rem] md:text-xs uppercase tracking-eyebrow text-text-secondary ${className}`}>
      {children}
    </p>
  );
}

// Teambition style placeholder: no Problem/Work/Decisions scaffolding
// forced around work that has not shipped. One short intro, two plain
// paragraphs, the hero facts, and the same Metadata card every other
// case study gets. See haoqi.design/teambition for the reference.
export default function CaseStudyNewStartMobile() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useDocumentMeta(
    "New Start Mobile | Marzia Saidi",
    "Redesigning three connected pages for New Start Mobile into one consistent system. Not yet live, the company has not implemented it."
  );

  return (
    <div className="min-h-screen bg-background text-text">
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

      <main>
        <section className="mx-auto px-6 md:px-10 py-[25px] max-w-5xl">
          <div className="max-w-[820px] pt-16 pb-8 md:pt-24">
            <Eyebrow className="mb-5">Case Study · Product Design (Internship)</Eyebrow>
            <h1 className="font-display font-bold text-6xl md:text-7xl text-text leading-[1.02] mb-2">
              New Start Mobile
            </h1>
            <p className="font-mono text-sm text-text-secondary/60 tabular-nums mb-10">
              Mid March to end of April 2026 · Internship
            </p>

            <div className="flex flex-col gap-6 text-lg leading-relaxed text-text-secondary max-w-2xl">
              <p>
                Redesigned three connected pages for New Start Mobile: home,
                product, and content, into one consistent system.
              </p>
              <p>
                Not yet live; the company hasn't implemented it. Case study
                follows once it ships, end of April 2026.
              </p>
            </div>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-8 mt-12 border-t border-border pt-10">
              {[
                ["Role", "Product Designer (Intern)"],
                ["Type", "Internship"],
                ["Company", "New Start Mobile"],
                ["Timeline", "Mid March to end of April 2026"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1.5">
                  <dt className="font-mono text-[0.65rem] uppercase tracking-meta text-text-secondary">{k}</dt>
                  <dd className="text-sm text-text leading-snug">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-col gap-6 text-lg leading-relaxed text-text-secondary max-w-2xl mt-16 pt-10 border-t border-border">
              <p>
                Connecting three pages that were supposed to feel like one
                product surfaced how much of the problem wasn't layout at
                all. It was a missing content system. The Mobile Coach page
                repeats its own Centralized Content Library card twice in
                one scroll. The testimonial block is the same quote,
                hardcoded, with the name and org swapped between pages.
                Every card in Latest Updates carries identical title and
                description text, just different tag colors. None of that
                is a visual bug; it's what happens when a site has no real
                data model behind its content, so every new page gets built
                by copying the last one and editing in place.
              </p>
              <p>
                The harder problem was brand continuity, not brand
                identity. Home Team and Mobile Coach each had their own
                coherent look, but neither one felt like it belonged to New
                Start Mobile once you clicked from the marketing site into
                the product pages. Different chrome, different color
                logic, no shared thread connecting the three. Redesigning
                three connected pages instead of one meant the real
                deliverable wasn't three screens. It was the system that
                makes them read as the same product no matter which one you
                land on first.
              </p>
            </div>

            <a
              href="https://newstartmobile.com"
              target="_blank"
              rel="noopener noreferrer"
              className="world-link inline-flex items-center gap-2 text-sm mt-10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            >
              newstartmobile.com
            </a>

            <div className="mt-16">
              <MetadataFooter
                fields={[
                  ["Last Updated", "Sep 2026"],
                  ["Read Time", "1 min"],
                  ["Word Count", "233"],
                ]}
              />
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-14 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-text-secondary/80 font-mono uppercase tracking-meta">
            Case study · New Start Mobile · Marzia Saidi
          </p>
          <a
            href="#/"
            className="link-dotted text-sm text-text-secondary hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            Back to portfolio
          </a>
        </div>
      </footer>
    </div>
  );
}
