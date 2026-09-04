import { ProjectCardFrame } from "./ProjectCardFrame";
import { ProjectPreview } from "./ProjectRow";

// The generic version of the haoqi.design-style card: same chrome as
// QalinPaperCard (via ProjectCardFrame), but the content is whatever
// preview the project already has — chat, device, validator — rather than
// a bespoke screen layout. Used for every featured project except Qalin.
//
// `banner*` fields (when present) show a dedicated static image here
// instead of the project's regular ProjectPreview — for a project like
// Quill & Pigeon whose Selected Work row still shows the live interactive
// demo, but whose Home card wants a plain screenshot instead.
export function HaoqiProjectCard({ project }) {
  return (
    <ProjectCardFrame project={project} color={project.cardColor || "#000000"}>
      <div
        className={`flex items-center justify-center ${project.previewPadding || "p-6 sm:p-10 md:p-12 lg:p-14"} ${
          project.previewMinHeight || "min-h-[320px] sm:min-h-[380px]"
        }`}
        data-cursor="view"
      >
        {project.bannerSrc ? (
          <img
            src={project.bannerSrc}
            alt={project.bannerAlt || project.previewAlt || ""}
            width={project.bannerWidth}
            height={project.bannerHeight}
            loading="lazy"
            className="w-full h-auto object-contain block max-w-full max-h-full"
          />
        ) : (
          <ProjectPreview project={project} />
        )}
      </div>
    </ProjectCardFrame>
  );
}

export default HaoqiProjectCard;
