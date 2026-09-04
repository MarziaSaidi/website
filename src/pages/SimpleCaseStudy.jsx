import { useEffect } from "react";
import Reveal from "../components/ui/Reveal";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { work } from "../data/work";
import { experience } from "../data/experience";
import { personalProjects } from "../data/personalProjects";
import ChatPreview from "../components/work/ChatPreview";
import ValidatorPreview from "../components/work/ValidatorPreview";

// A lighter case-study template for projects that don't have a full
// hand-written narrative (Survue/Relay/Get Campus each have their own
// bespoke page with real process detail) — built entirely from data
// that already exists in data/work.js and data/experience.js, plus the
// real interactive preview component the project already has, rather
// than inventing "constraints" or "decisions" content with no basis.
const PREVIEW_COMPONENTS = {
  chat: ChatPreview,
  validator: ValidatorPreview,
};

function Eyebrow({ children, className = "" }) {
  return (
    <p className={`font-mono text-[0.7rem] md:text-xs uppercase tracking-eyebrow text-[var(--world-accent,var(--color-label))] ${className}`}>
      {children}
    </p>
  );
}

function BackLink({ className }) {
  return (
    <a
      href="#/"
      className={`group inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm ${className || ""}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M11 18l-6-6 6-6" />
      </svg>
      Back to all work
    </a>
  );
}

function Section({ eyebrow, title, children }) {
  return (
    <Reveal as="section" className="mx-auto max-w-[820px] px-6 md:px-10 py-20 md:py-32 border-t border-border">
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      {title && <h2 className="font-serif text-3xl md:text-4xl text-text leading-tight mt-4 mb-8">{title}</h2>}
      {children}
    </Reveal>
  );
}

export default function SimpleCaseStudy({ projectId }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const project = work.find((p) => p.id === projectId);
  const exp = experience.find((e) => e.company === project.name);
  const solo = personalProjects.find((p) => p.projectId === projectId);
  const PreviewComponent = PREVIEW_COMPONENTS[project.preview];

  // "At a glance" facts differ by source: an internship has a role/
  // company/timeline, a solo project has a label and its real tech stack.
  const glance = exp
    ? [
        { label: "Role", value: exp.role },
        { label: "Company", value: exp.company },
        { label: "Timeline", value: exp.dates },
      ]
    : solo
    ? [{ label: solo.label, value: solo.techStack.join("  ·  "), wide: true }]
    : null;

  const intro = exp?.intro || solo?.intro || project.description;
  const bulletsLabel = exp?.bulletsLabel || solo?.bulletsLabel;
  const bullets = exp?.bullets || solo?.bullets;
  const lesson = exp?.lesson || solo?.lesson;

  useDocumentMeta(`${project.name} | Marzia Saidi`, intro);

  return (
    <div data-world={project.world} className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <BackLink />
          <a href="#/" className="font-serif text-lg text-text tracking-wide">
            Marzia Saidi
          </a>
        </div>
      </header>

      <div className="max-w-[820px] mx-auto px-6 md:px-10 pt-20 md:pt-32 pb-14">
        <Eyebrow className="enter enter-1">{project.labels.join("  ·  ")}</Eyebrow>
        <h1 className="enter enter-2 font-serif text-4xl md:text-6xl text-text leading-tight mt-4">
          {project.name}
        </h1>
        <p className="enter enter-3 text-text-secondary text-lg leading-relaxed mt-6 max-w-xl">{intro}</p>
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="enter enter-4 world-link group/link inline-flex items-center gap-2 text-sm mt-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
          >
            {project.liveLabel || "Visit live site"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M18 6H8M18 6V16" />
            </svg>
          </a>
        )}
      </div>

      {glance && (
        <Section eyebrow="At a glance">
          <div className={`grid gap-8 md:gap-10 ${glance.length > 1 ? "sm:grid-cols-3" : ""}`}>
            {glance.map((g) => (
              <div key={g.label} className={g.wide ? "sm:max-w-2xl" : undefined}>
                <p className="text-xs uppercase tracking-wide text-text-secondary mb-1">{g.label}</p>
                <p className="text-text">{g.value}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {bullets && (
        <Section eyebrow={bulletsLabel}>
          <ul className="flex flex-col gap-6">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-4 text-text-secondary leading-relaxed">
                <span className="font-serif text-[var(--world-accent,var(--color-accent))] tabular-nums shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {b}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {PreviewComponent && (
        <Section eyebrow="See it in action" title="A working piece of the product">
          <div data-cursor="view">
            <PreviewComponent />
          </div>
        </Section>
      )}

      {lesson && (
        <Section eyebrow="Takeaway">
          <blockquote className="font-serif italic text-2xl md:text-3xl text-text leading-snug border-l-2 pl-6" style={{ borderColor: "var(--world-accent, var(--color-accent))" }}>
            &ldquo;{lesson.text}&rdquo;
          </blockquote>
        </Section>
      )}

      <div className="max-w-[820px] mx-auto px-6 md:px-10 py-14 border-t border-border">
        <BackLink />
      </div>
    </div>
  );
}
