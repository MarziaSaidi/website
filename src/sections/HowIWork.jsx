import SectionHeading from "../components/ui/SectionHeading";
import { useScrollReveal } from "../hooks/useScrollReveal";

const steps = [
  {
    number: "01",
    title: "Understand the problem",
    body: "Before building, I try to understand who is using the product and what problem needs solving.",
  },
  {
    number: "02",
    title: "Build thoughtfully",
    body: "I care about writing maintainable code, choosing the right tools, and creating systems that can grow.",
  },
  {
    number: "03",
    title: "Improve through feedback",
    body: "The best products come from iteration. I enjoy working with users, teammates, and stakeholders to make things better.",
  },
];

export default function HowIWork() {
  const groupRef = useScrollReveal();

  return (
    <section id="approach" aria-labelledby="approach-heading" className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <SectionHeading
          index="07"
          eyebrow="How I Work"
          title="My approach"
          className="mb-14"
        />

        <div
          ref={groupRef}
          className="reveal-group grid md:grid-cols-3 gap-10 md:gap-8"
        >
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="stagger-item flex flex-col gap-4 border-t border-border pt-6"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <span className="font-serif text-3xl text-gold tabular-nums" aria-hidden="true">
                {step.number}
              </span>
              <h3 className="font-serif text-xl text-text">{step.title}</h3>
              <p className="text-text-secondary leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
