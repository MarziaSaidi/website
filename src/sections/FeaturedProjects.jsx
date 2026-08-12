import SectionHeading from "../components/ui/SectionHeading";
import Illustration from "../components/ui/Illustration";
import Reveal from "../components/ui/Reveal";
import { choreBoard, soloEats } from "../data/projects";

function Bullet({ children }) {
  return (
    <li className="pl-4 relative before:absolute before:left-0 before:top-[0.65em] before:w-1.5 before:h-px before:bg-gold">
      {children}
    </li>
  );
}

export default function FeaturedProjects() {
  return (
    <section id="chore-board" aria-labelledby="projects-featured-heading" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <SectionHeading
          index="03"
          eyebrow="Projects"
          title="Featured Projects"
          className="mb-16"
        />

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="md:order-2 flex flex-col gap-14">
            {/* Chore Board */}
            <Reveal className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-3xl text-text">{choreBoard.name}</h3>
                <p className="text-text-secondary leading-relaxed">{choreBoard.tagline}</p>
              </div>

              <ul className="flex flex-col gap-2 text-text-secondary leading-relaxed">
                {choreBoard.bullets.map((bullet) => (
                  <Bullet key={bullet}>{bullet}</Bullet>
                ))}
              </ul>

              <p className="text-xs tracking-wide uppercase text-text-secondary">
                {choreBoard.tags.join("  ·  ")}
              </p>

              <a
                href={choreBoard.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
              >
                View Live Project
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M18 6H8M18 6V16" />
                </svg>
              </a>
            </Reveal>

            {/* Solo Eats */}
            <Reveal className="flex flex-col gap-6 border-t border-border pt-14">
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-3xl text-text">{soloEats.name}</h3>
                <p className="text-text-secondary leading-relaxed">{soloEats.tagline}</p>
              </div>

              <p className="text-text-secondary leading-relaxed">{soloEats.description}</p>

              <div className="flex flex-col gap-2">
                <p className="text-text-secondary leading-relaxed">{soloEats.featuresLabel}</p>
                <ul className="flex flex-col gap-2 text-text-secondary leading-relaxed">
                  {soloEats.bullets.map((bullet) => (
                    <Bullet key={bullet}>{bullet}</Bullet>
                  ))}
                </ul>
              </div>

              <p className="text-text-secondary leading-relaxed">{soloEats.closing}</p>
            </Reveal>
          </div>

          <Illustration
            src="/illustrations/hindu-kush.png"
            alt="Hand-drawn pencil illustration of a citadel in the Hindu Kush mountains"
            decorative={false}
            className="md:order-1"
            imgClassName="opacity-40"
          />
        </div>
      </div>
    </section>
  );
}
