import SectionHeading from "../components/ui/SectionHeading";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { experience } from "../data/experience";

function TimelineItem({ item }) {
  const ref = useScrollReveal();

  return (
    <li ref={ref} className="reveal relative pl-10 md:pl-14 pb-14 last:pb-0">
      <span className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-gold" aria-hidden="true" />
      <span className="absolute left-[3px] top-5 bottom-0 w-px bg-border last:hidden" aria-hidden="true" />

      <p className="text-xs tracking-[0.2em] uppercase text-text-secondary mb-2">
        {item.dates}
      </p>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
        <h3 className="font-serif text-2xl text-text">{item.role}</h3>
        <span className="text-gold text-sm">{item.company}</span>
      </div>
      <p className="text-text-secondary text-sm mb-4">{item.location}</p>

      <ul className="flex flex-col gap-2 text-text-secondary leading-relaxed mb-5">
        {item.bullets.map((bullet) => (
          <li key={bullet} className="pl-4 relative before:absolute before:left-0 before:top-[0.65em] before:w-1.5 before:h-px before:bg-gold">
            {bullet}
          </li>
        ))}
      </ul>

      <p className="text-xs tracking-wide uppercase text-text-secondary">
        {item.tags.join("  ·  ")}
      </p>
    </li>
  );
}

export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-heading" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-[1fr_auto] gap-10 items-start mb-16">
          <SectionHeading
            index="03"
            eyebrow="Career History"
            title="Where I've made an impact"
            description="A breakdown of my professional roles, combining web development, mobile applications, and user experience design."
          />
          <img
            src="/illustrations/markhor.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="w-48 sm:w-56 md:w-48 lg:w-56 h-auto object-contain opacity-90 self-center md:self-end mx-auto md:mx-0"
          />
        </div>

        <div className="grid md:grid-cols-[1fr_auto] gap-10 items-end">
          <ol className="max-w-2xl">
            {experience.map((item) => (
              <TimelineItem key={item.company} item={item} />
            ))}
          </ol>
          <img
            src="/illustrations/minaret.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="h-80 sm:h-96 md:h-[28rem] lg:h-[32rem] xl:h-[40rem] w-auto object-contain opacity-90 self-center md:self-end mx-auto md:mx-0 mt-8 md:mt-0"
          />
        </div>
      </div>
    </section>
  );
}
