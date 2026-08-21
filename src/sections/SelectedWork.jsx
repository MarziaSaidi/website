import { useScrollReveal } from "../hooks/useScrollReveal";
import { work } from "../data/work";
import { ProjectRow } from "../components/work/ProjectRow";

function WorkHeading() {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="reveal">
      <div className="border-t border-border" />
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-28 md:pt-40 pb-16 md:pb-20">
        <h2 id="selected-work-heading" className="font-display font-bold text-5xl md:text-7xl text-text leading-[1.05]">
          My Works
        </h2>
      </div>
    </div>
  );
}

export default function SelectedWork() {
  return (
    <section id="selected-work" aria-labelledby="selected-work-heading" className="pb-28 md:pb-40">
      <WorkHeading />
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="flex flex-col">
          {work.map((project, i) => (
            <ProjectRow
              key={project.id}
              project={project}
              index={String(i + 1).padStart(2, "0")}
              reverse={i % 2 === 1}
              imageLeft={i % 2 === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
