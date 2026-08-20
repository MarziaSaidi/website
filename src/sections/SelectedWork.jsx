import { useState } from "react";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useFilteredList } from "../hooks/useFilteredList";
import { CATEGORIES, DEFAULT_CATEGORY, work } from "../data/work";
import { navigateWithTransition } from "../utils/viewTransition";
import BrowserChrome from "../components/work/BrowserChrome";
import PhoneFrame from "../components/work/PhoneFrame";
import ChatPreview from "../components/work/ChatPreview";
import ValidatorPreview from "../components/work/ValidatorPreview";

function matchesCategory(project, active) {
  return active === "all" || project.category === active;
}

// Case-study links get a real view transition instead of a hard cut; the
// project's title carries a matching viewTransitionName so it morphs into
// the case-study hero (see the "Back to portfolio" link on those pages).
function isCaseStudyHref(href) {
  return typeof href === "string" && href.startsWith("#/");
}

function ProjectLabels({ labels, className = "" }) {
  return (
    <p className={`font-mono text-[0.65rem] uppercase tracking-[0.14em] text-label ${className}`}>
      {labels.join("  ·  ")}
    </p>
  );
}

function ProjectLinks({ project }) {
  if (!project.href && !project.live) return null;
  const isCaseStudy = isCaseStudyHref(project.href);
  return (
    <div className="flex items-center gap-5 pt-1 flex-wrap">
      {project.href && (
        <a
          href={project.href}
          onClick={
            isCaseStudy
              ? (e) => {
                  e.preventDefault();
                  navigateWithTransition(project.href);
                }
              : undefined
          }
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
          {project.liveLabel}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M18 6H8M18 6V16" />
          </svg>
        </a>
      )}
    </div>
  );
}

// Dispatches to the right presentation for what the project actually is —
// a live chat surface, a real device screenshot, a real browser screenshot,
// or real validator output — never a generic stock image.
function ProjectPreview({ project }) {
  switch (project.preview) {
    case "chat":
      return <ChatPreview />;
    case "validator":
      return <ValidatorPreview />;
    case "device":
      return (
        <PhoneFrame>
          <img
            src={project.previewSrc}
            alt={project.previewAlt}
            width={project.previewWidth}
            height={project.previewHeight}
            loading="lazy"
            className="w-full h-auto block"
          />
        </PhoneFrame>
      );
    case "browser":
      // Wide desktop screenshots don't just shrink on small viewports — a
      // 16:10 dashboard scaled to phone width turns its own labels
      // illegible. Below sm, crop to a wider-than-source strip (object-fit
      // cover crops the *far* axis from the container's aspect ratio, so a
      // container wider than the 16:10 source crops height, not width —
      // keeping the full-width KPI band at the top in frame and trimming
      // the chart/table below it); at sm+ the image reverts to its natural
      // aspect ratio, shown in full.
      return (
        <BrowserChrome url={project.previewUrl}>
          <div className="aspect-[16/9] sm:aspect-auto overflow-hidden">
            <img
              src={project.previewSrc}
              alt={project.previewAlt}
              width={project.previewWidth}
              height={project.previewHeight}
              loading="lazy"
              className="w-full h-full object-cover object-top sm:h-auto sm:object-contain block"
            />
          </div>
        </BrowserChrome>
      );
    default:
      return null;
  }
}

// Tier 1 — the flagship pair: full-width, preview and text side by side,
// alternating which side the preview sits on for rhythm.
function Tier1Row({ project, index, reverse }) {
  const ref = useScrollReveal();
  const text = (
    <div className="flex flex-col gap-4 max-w-lg">
      <div className="flex items-center gap-3">
        <span className="font-serif text-sm text-border tabular-nums" aria-hidden="true">
          {index}
        </span>
        <ProjectLabels labels={project.labels} />
      </div>
      <h3
        className="font-serif text-4xl md:text-5xl text-text leading-tight"
        style={isCaseStudyHref(project.href) ? { viewTransitionName: `project-title-${project.id}` } : undefined}
      >
        {project.name}
      </h3>
      <p className="text-text-secondary text-lg leading-relaxed">{project.description}</p>
      <ProjectLinks project={project} />
    </div>
  );
  const preview = <ProjectPreview project={project} />;

  return (
    <div ref={ref} className="reveal border-t border-border pt-10 pb-2">
      <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-center">
        {reverse ? (
          <>
            <div className="md:order-2">{preview}</div>
            <div className="md:order-1">{text}</div>
          </>
        ) : (
          <>
            {text}
            {preview}
          </>
        )}
      </div>
    </div>
  );
}

// Tier 2 — important supporting work. A preview (when there is a real one)
// sets the card's own visual boundary; text-only cards get a paper card.
function Tier2Card({ project }) {
  const ref = useScrollReveal();
  const hasPreview = project.preview !== "none";
  return (
    <div
      ref={ref}
      className={`reveal flex flex-col gap-4 h-full ${
        hasPreview ? "" : "bg-paper border border-border rounded-lg shadow-soft p-6"
      }`}
    >
      {hasPreview && <ProjectPreview project={project} />}
      <div className="flex flex-col gap-2.5">
        <ProjectLabels labels={project.labels} />
        <h3
          className="font-serif text-2xl text-text leading-snug"
          style={isCaseStudyHref(project.href) ? { viewTransitionName: `project-title-${project.id}` } : undefined}
        >
          {project.name}
        </h3>
        <p className="text-text-secondary leading-relaxed text-sm">{project.description}</p>
        <ProjectLinks project={project} />
      </div>
    </div>
  );
}

// Tier 3 — supporting engineering evidence. Same idea as tier 2, smaller.
function Tier3Card({ project }) {
  const ref = useScrollReveal();
  const hasPreview = project.preview !== "none";
  return (
    <div
      ref={ref}
      className={`reveal flex flex-col gap-3 h-full ${
        hasPreview ? "" : "bg-paper border border-border rounded-lg shadow-soft p-5"
      }`}
    >
      {hasPreview && <ProjectPreview project={project} />}
      <div className="flex flex-col gap-2">
        <ProjectLabels labels={project.labels} />
        <h3 className="font-serif text-lg text-text leading-snug">{project.name}</h3>
        <p className="text-text-secondary leading-relaxed text-xs">{project.description}</p>
        <ProjectLinks project={project} />
      </div>
    </div>
  );
}

// Selected Work is the one section that breaks the page's otherwise
// uniform SECTION/SECTION/SECTION rhythm: a full-bleed rule (not
// constrained to the same max-w-6xl column as every other section) and a
// heading that outranks the rest of the page, because this is the section
// that has to do the most work in the first few seconds.
function WorkHeading() {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="reveal">
      <div className="border-t border-border" />
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-24 md:pt-32 pb-12 md:pb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-serif text-sm text-label tabular-nums" aria-hidden="true">01</span>
          <span className="block h-px w-6 bg-gold divider-draw" aria-hidden="true" />
          <p className="text-xs tracking-[0.25em] uppercase text-text-secondary">Selected Work</p>
        </div>
        <h2
          id="selected-work-heading"
          className="text-5xl md:text-7xl text-text leading-[1.05] max-w-3xl"
        >
          Product work I've designed and built
        </h2>
        <p className="text-text-secondary leading-relaxed max-w-xl mt-5">
          Organized by what each project demonstrates, not by job title. Design + Build is where the two meet.
        </p>
      </div>
    </div>
  );
}

export default function SelectedWork() {
  const [active, setActive] = useState(DEFAULT_CATEGORY);
  const { renderItems, refFor } = useFilteredList(work, active, matchesCategory);

  let tier1Seen = 0;

  return (
    <section id="selected-work" aria-labelledby="selected-work-heading" className="pb-24 md:pb-32">
      <WorkHeading />
      <div className="max-w-6xl mx-auto px-6 md:px-10">
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
                    ? "bg-accent text-text border-accent"
                    : "bg-transparent text-text-secondary border-border hover:text-text hover:border-text-secondary"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div
          aria-live="polite"
          className="grid md:grid-cols-2 gap-x-10 gap-y-8 items-start"
        >
          {renderItems.map((project) => {
            if (project.tier === 1) {
              tier1Seen += 1;
              const index = String(tier1Seen).padStart(2, "0");
              return (
                <div key={project.id} ref={refFor(project.id)} className="md:col-span-2">
                  <Tier1Row project={project} index={index} reverse={tier1Seen % 2 === 0} />
                </div>
              );
            }
            if (project.tier === 2) {
              return (
                <div key={project.id} ref={refFor(project.id)}>
                  <Tier2Card project={project} />
                </div>
              );
            }
            return (
              <div key={project.id} ref={refFor(project.id)}>
                <Tier3Card project={project} />
              </div>
            );
          })}

          {renderItems.length === 0 && (
            <p className="text-text-secondary md:col-span-2">No projects in this category yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
