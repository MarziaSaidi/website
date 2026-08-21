import { useScrollReveal } from "../hooks/useScrollReveal";
import { work } from "../data/work";
import { ProjectRow } from "../components/work/ProjectRow";

// A hand-picked trio shown on Home, using the same ProjectRow the full
// Selected Work page uses — not a separate visual system, just a smaller
// dose of it, closing with a link out to the full list.
const FEATURED_IDS = ["supportiq", "quill-pigeon", "survue"];

function FeaturedWorkHeading() {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="reveal">
      <div className="border-t border-border" />
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-12 md:pb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="block h-px w-6 bg-gold divider-draw" aria-hidden="true" />
          <p className="text-xs tracking-[0.25em] uppercase text-text-secondary">Selected Work</p>
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
    <div ref={ref} className="reveal max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-24">
      <a
        href="#/work"
        className="group inline-flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
      >
        <span className="text-xs tracking-[0.25em] uppercase text-text-secondary">There's more</span>
        <span className="inline-flex items-center gap-4 font-serif text-4xl md:text-6xl text-text leading-tight group-hover:text-accent transition-colors duration-300">
          View all projects
          <svg
            width="44"
            height="16"
            viewBox="0 0 48 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M0 8h44M38 2l6 6-6 6" />
          </svg>
        </span>
      </a>
    </div>
  );
}

export default function FeaturedWork() {
  const featured = FEATURED_IDS.map((id) => work.find((p) => p.id === id)).filter(Boolean);

  return (
    <section id="featured-work" aria-labelledby="featured-work-heading" className="pb-24 md:pb-32">
      <FeaturedWorkHeading />
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex flex-col gap-2">
        {featured.map((project, i) => (
          // reverse controls mobile stacking only (unchanged); imageLeft is
          // the independent desktop left/right control — project 1 and 3
          // both image-left, project 2 the alternate.
          <ProjectRow
            key={project.id}
            project={project}
            index={String(i + 1).padStart(2, "0")}
            reverse={i % 2 === 1}
            imageLeft={i % 2 === 0}
          />
        ))}
      </div>
      <ViewAllLink />
    </section>
  );
}
