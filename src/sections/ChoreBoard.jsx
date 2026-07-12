import SectionHeading from "../components/ui/SectionHeading";
import Illustration from "../components/ui/Illustration";
import { choreBoard } from "../data/projects";

export default function ChoreBoard() {
  return (
    <section id="chore-board" aria-labelledby="chore-board-heading" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col gap-8 md:order-2">
          <SectionHeading
            index="02"
            eyebrow="Project"
            title={choreBoard.name}
            description={choreBoard.tagline}
          />

          <ul className="flex flex-col gap-2 text-text-secondary leading-relaxed">
            {choreBoard.bullets.map((bullet) => (
              <li
                key={bullet}
                className="pl-4 relative before:absolute before:left-0 before:top-[0.65em] before:w-1.5 before:h-px before:bg-gold"
              >
                {bullet}
              </li>
            ))}
          </ul>

          <p className="text-xs tracking-wide uppercase text-text-secondary">
            {choreBoard.tags.join("  ·  ")}
          </p>

          <a
            href={choreBoard.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
          >
            View Live Project
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M18 6H8M18 6V16" />
            </svg>
          </a>
        </div>

        <Illustration
          src="/illustrations/hindu-kush.png"
          alt="Hand-drawn pencil illustration of a citadel in the Hindu Kush mountains"
          decorative={false}
          className="md:order-1"
        />
      </div>
    </section>
  );
}
