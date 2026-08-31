import { useScrollReveal } from "../hooks/useScrollReveal";
import { work } from "../data/work";
import { ProjectRow } from "../components/work/ProjectRow";

// A hand-picked lineup shown on Home, using the same ProjectRow the full
// Selected Work page uses — not a separate visual system, just a smaller
// dose of it, closing with a link out to the full list. Qalin leads as the
// newest project and gets a "NEW" marker instead of a numeral; the rest
// keep the 01/02/03 numbering they had before it was added.
const FEATURED_IDS = ["qalin", "supportiq", "quill-pigeon", "survue"];

function FeaturedWorkHeading() {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="reveal">
      <div className="border-t border-border" />
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-24 md:pt-36 pb-16 md:pb-20">
        <div className="flex items-center gap-3 mb-8">
          <span className="block h-px w-6 bg-gold divider-draw" aria-hidden="true" />
          <p className="text-xs tracking-eyebrow uppercase text-text-secondary">Selected Work</p>
        </div>
        <h2 id="featured-work-heading" className="text-4xl md:text-6xl text-text leading-[1.05] max-w-2xl">
          A few things I've designed and built
        </h2>
      </div>
    </div>
  );
}

function ViewAllLink() {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="reveal max-w-6xl mx-auto px-6 md:px-10 pt-20 md:pt-32">
      {/* Keeps its own editorial scale and long rule-arrow, but borrows the
          site's shared hover choreography (label swap + sweeping rule) so
          it reads as the same interaction language as the pill CTAs. */}
      <a
        href="#/work"
        className="btn btn--quiet group/more inline-flex flex-col gap-3 [--btn-leading:1.3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
      >
        <span className="text-xs tracking-eyebrow uppercase text-text-secondary">There's more</span>
        <span className="relative inline-flex items-center gap-4 pb-3 font-serif text-4xl md:text-6xl text-text leading-tight">
          <span className="btn__label">
            <span className="btn__label-base">View all projects</span>
            <span className="btn__label-hover" aria-hidden="true">
              View all projects
            </span>
          </span>
          <svg
            width="44"
            height="16"
            viewBox="0 0 48 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            className="relative z-[2] shrink-0 transition-transform duration-[var(--dur-travel)] ease-[var(--ease-exit)] group-hover/more:translate-x-3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M0 8h44M38 2l6 6-6 6" />
          </svg>
          <span aria-hidden="true" className="btn__rule" />
        </span>
      </a>
    </div>
  );
}

export default function FeaturedWork() {
  const featured = FEATURED_IDS.map((id) => work.find((p) => p.id === id)).filter(Boolean);

  return (
    <section id="featured-work" aria-labelledby="featured-work-heading" className="pb-28 md:pb-40">
      <FeaturedWorkHeading />
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex flex-col gap-2">
        {featured.map((project, i) => (
          // reverse controls mobile stacking only (unchanged); imageLeft is
          // the independent desktop left/right control — project 1 and 3
          // both image-left, project 2 the alternate. Qalin (i === 0) shows
          // "NEW" instead of a numeral; the rest number from 01 as before.
          <ProjectRow
            key={project.id}
            project={project}
            index={project.id === "qalin" ? "NEW" : String(i).padStart(2, "0")}
            reverse={i % 2 === 1}
            imageLeft={i % 2 === 0}
          />
        ))}
      </div>
      <ViewAllLink />
    </section>
  );
}
