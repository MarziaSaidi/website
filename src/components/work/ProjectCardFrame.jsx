import { useScrollReveal } from "../../hooks/useScrollReveal";
import { OriginTag } from "./ProjectRow";

// Shared chrome for the haoqi.design-style featured-work cards: a flat
// color block (no radius, no border, no shadow — the color and the corner
// tag carry the "this is a project" signal instead of elevation), a boxed
// origin tag flush in the corner, and a plain name/date caption underneath
// rather than the display headline ProjectRow uses. QalinPaperCard and the
// generic HaoqiProjectCard both wrap their own preview content in this.
// Always fills its container — FeaturedWork.jsx decides whether that's a
// half-width solo slot or one half of a paired row.
export function ProjectCardFrame({ project, color = "#000000", children }) {
  const ref = useScrollReveal();

  return (
    <div ref={ref} data-world={project.world} className="reveal py-8 sm:py-10 md:py-14">
      <div className="relative overflow-visible w-full" style={{ background: color }}>
        <OriginTag type={project.type} boxed color="#FF6B61" className="absolute top-0 right-0 z-10" />
        {children}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-4 w-full">
        <a href={project.href} className="w-fit focus-visible:outline-none">
          <h3 className="font-display font-semibold text-sm sm:text-base uppercase tracking-wide text-text transition-colors duration-300 hover:text-[#8a6b3f]">
            {project.name}
          </h3>
        </a>
        {project.date && (
          <span className="font-mono text-xs tracking-meta text-text-secondary shrink-0">{project.date}</span>
        )}
      </div>
    </div>
  );
}

export default ProjectCardFrame;
