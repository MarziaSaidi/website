import SectionHeading from "../components/ui/SectionHeading";
import { useScrollReveal } from "../hooks/useScrollReveal";

const studies = [
  {
    href: "#/survue",
    kicker: "Mobile UX Design",
    name: "Survue",
    blurb:
      "Leading UX for a cyclist-safety app: designing calm, glanceable alerts a rider can trust while their eyes stay on the road.",
    tags: [".NET MAUI", "iOS · Android · Windows", "Safety alerts"],
  },
  {
    href: "#/relay",
    kicker: "Product Design",
    name: "Relay",
    blurb:
      "A last-mile delivery operations console: a high-density, real-time surface a dispatcher can scan and operate under pressure.",
    tags: ["Real-time UI", "Information design", "Desktop console"],
  },
];

function StudyCard({ study }) {
  const ref = useScrollReveal();
  return (
    <a
      ref={ref}
      href={study.href}
      className="reveal hover-lift group bg-paper border border-border rounded-lg shadow-soft p-8 md:p-10 flex flex-col gap-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-gold">
        {study.kicker}
      </p>
      <h3 className="font-serif text-3xl text-text">{study.name}</h3>
      <p className="text-text-secondary leading-relaxed flex-1">{study.blurb}</p>
      <p className="text-xs tracking-wide uppercase text-text-secondary">
        {study.tags.join("  ·  ")}
      </p>
      <span className="inline-flex items-center gap-2 text-sm text-accent group-hover:text-accent-secondary transition-colors">
        View case study
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </a>
  );
}

export default function CaseStudies() {
  return (
    <section id="case-studies" aria-labelledby="case-studies-heading" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <SectionHeading
          index="01"
          eyebrow="Case Studies"
          title="Design case studies"
          description="Deeper looks at how I approach complex product surfaces, from first-second safety alerts to a dense, real-time operations console."
          className="mb-14"
        />
        <div className="grid md:grid-cols-2 gap-8">
          {studies.map((study) => (
            <StudyCard key={study.href} study={study} />
          ))}
        </div>
      </div>
    </section>
  );
}
