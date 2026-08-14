import { useMemo, useState } from "react";
import SectionHeading from "../components/ui/SectionHeading";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { CATEGORIES, work } from "../data/work";

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

// Plain label text, not a pill/badge — a bordered rounded shape here would
// read as a clickable control next to the real filter buttons above it.
function MetaPill({ project }) {
  return (
    <span className="w-fit text-[0.65rem] font-mono uppercase tracking-[0.14em] text-label">
      {project.context} · {CATEGORY_LABEL[project.category]}
    </span>
  );
}

function ProjectLinks({ project }) {
  if (!project.href && !project.live) return null;
  return (
    <div className="flex items-center gap-5 pt-1">
      {project.href && (
        <a
          href={project.href}
          className="group/link inline-flex items-center gap-2 text-sm text-accent hover:text-accent-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
        >
          {project.hrefLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" className="transition-transform duration-300 group-hover/link:translate-x-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      )}
      {project.live && (
        <a
          href={project.live}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
        >
          {project.href ? "Live prototype" : "Live project"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M18 6H8M18 6V16" />
          </svg>
        </a>
      )}
    </div>
  );
}

// Large treatment for the two flagship projects: no screenshot, no device
// mockup — an oversized index numeral and typography carry the weight.
// Editorial, not a template "hero image" card.
function FeaturedRow({ project, index }) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className="reveal group border-t border-border pt-10 pb-2 grid md:grid-cols-[auto_1fr] gap-6 md:gap-12 items-start"
    >
      <span
        className="font-serif text-7xl md:text-8xl leading-none tabular-nums text-border transition-colors duration-500 group-hover:text-bronze/60"
        aria-hidden="true"
      >
        {index}
      </span>

      <div className="flex flex-col gap-4 max-w-2xl">
        <MetaPill project={project} />

        <div className="flex flex-col gap-1.5">
          <h3 className="font-serif text-4xl md:text-5xl text-text leading-tight">{project.name}</h3>
          <p className="text-text-secondary text-lg leading-relaxed">{project.oneLiner}</p>
        </div>

        <p className="text-text-secondary leading-relaxed">{project.contribution}</p>

        <p className="text-xs tracking-wide uppercase text-text-secondary pt-1">
          {project.tags.join("  ·  ")}
        </p>

        <ProjectLinks project={project} />
      </div>
    </div>
  );
}

// Compact treatment for the rest: same honest, text-led card, no fabricated
// preview.
function CompactRow({ project }) {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      className="reveal hover-lift bg-paper border border-border rounded-lg shadow-soft p-6 flex flex-col gap-3"
    >
      <MetaPill project={project} />
      <div className="flex flex-col gap-1">
        <h3 className="font-serif text-xl text-text">{project.name}</h3>
        <p className="text-text-secondary leading-relaxed text-sm">{project.oneLiner}</p>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">{project.contribution}</p>
      <p className="text-xs tracking-wide uppercase text-text-secondary mt-auto pt-1">
        {project.tags.join("  ·  ")}
      </p>
      <ProjectLinks project={project} />
    </div>
  );
}

export default function SelectedWork() {
  const [active, setActive] = useState("all");

  const filtered = useMemo(
    () => (active === "all" ? work : work.filter((p) => p.category === active)),
    [active]
  );

  const featured = filtered.filter((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  return (
    <section id="selected-work" aria-labelledby="selected-work-heading" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <SectionHeading
          index="01"
          eyebrow="Selected Work"
          title="Design and engineering, across every kind of project"
          description="Internships and personal work, unified. Filter by what I did, not where it came from."
          headingId="selected-work-heading"
          className="mb-10"
        />

        <div
          role="group"
          aria-label="Filter selected work by category"
          className="flex flex-wrap gap-2 mb-12"
        >
          {CATEGORIES.map((c) => {
            const isActive = active === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(c.id)}
                className={`text-sm rounded-full px-4 py-2 border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze ${
                  isActive
                    ? "bg-accent text-background border-accent"
                    : "bg-transparent text-text-secondary border-border hover:text-text hover:border-text-secondary"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div aria-live="polite" className="flex flex-col gap-2">
          {featured.map((project, i) => (
            <FeaturedRow key={project.id} project={project} index={String(i + 1).padStart(2, "0")} />
          ))}

          {rest.length > 0 && (
            <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-6 ${featured.length > 0 ? "mt-12" : ""}`}>
              {rest.map((project) => (
                <CompactRow key={project.id} project={project} />
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <p className="text-text-secondary">No projects in this category yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
