import SectionHeading from "../components/ui/SectionHeading";
import Button from "../components/ui/Button";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { experience } from "../data/experience";

function year(dates) {
  const match = dates.match(/\d{4}/);
  return match ? match[0] : dates;
}

function ExperienceRow({ item }) {
  const ref = useScrollReveal();

  return (
    <li ref={ref} data-world={item.world} className="reveal border-t border-border py-9 md:py-11 first:border-t-0">
      <details className="group">
        <summary className="flex flex-wrap items-baseline gap-x-4 gap-y-1 cursor-pointer list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
          <span className="font-mono text-xs text-text-secondary tabular-nums w-14 shrink-0">
            {year(item.dates)}
          </span>
          <h3 className="font-serif text-xl text-text">{item.role}</h3>
          <span className="text-text-secondary text-sm">{item.company}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            className="ml-auto shrink-0 text-text-secondary transition-transform duration-300 group-open:rotate-180"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </summary>

        <div className="mt-5 pl-[4.5rem] flex flex-col gap-5">
          <p className="text-text-secondary text-sm">{item.location}</p>

          {item.intro && (
            <p className="text-text-secondary leading-relaxed">{item.intro}</p>
          )}

          {item.bullets.length > 0 && (
            <ul className="flex flex-col gap-2 text-text-secondary leading-relaxed">
              {item.bullets.map((bullet) => (
                <li key={bullet} className="pl-4 relative before:absolute before:left-0 before:top-[0.65em] before:w-1.5 before:h-px before:bg-accent-secondary">
                  {bullet}
                </li>
              ))}
            </ul>
          )}

          {item.lesson && (
            <p className="text-text-secondary leading-relaxed">
              {item.lesson.label && (
                <span className="text-text">{item.lesson.label} </span>
              )}
              {item.lesson.text}
            </p>
          )}

          <p className="text-xs tracking-wide uppercase text-text-secondary">
            {item.tags.join("  ·  ")}
          </p>

          {item.caseStudyHref && (
            <Button href={item.caseStudyHref} variant="quiet" className="w-fit">
              View case study
            </Button>
          )}
        </div>
      </details>
    </li>
  );
}

export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-heading" className="py-28 md:py-44">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <SectionHeading
          index="02"
          eyebrow="Experience"
          title="Four internships, on real teams"
          description="Year, role, and company at a glance. Open any row for the detail."
          headingId="experience-heading"
          className="mb-16 md:mb-24"
        />

        <ol className="max-w-3xl">
          {experience.map((item) => (
            <ExperienceRow key={item.company} item={item} />
          ))}
        </ol>
      </div>
    </section>
  );
}
