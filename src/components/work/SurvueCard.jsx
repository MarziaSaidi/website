import { ProjectCardFrame } from "./ProjectCardFrame";

// Survue's card content: three real screens from the app side by side —
// live ride monitoring (the flagship alert screen), the home screen, and
// the automatic recordings list. Each screenshot already has its own
// dark phone-mockup background baked in (not a transparent cutout like
// Qalin's), so they sit upright and evenly sized rather than the tilted,
// rotated arrangement that only works with a transparent surround.
const SCREENS = [
  { src: "/survue/ride-monitoring.webp", alt: "Survue's live ride monitoring alert screen" },
  { src: "/survue/home-screen.webp", alt: "Survue's home screen while actively recording a ride" },
  { src: "/survue/recordings.webp", alt: "Survue's automatic recordings list" },
];

export function SurvueCard({ project }) {
  return (
    <ProjectCardFrame project={project} color={project.cardColor || "#000000"}>
      <div className="flex items-start justify-center gap-4 sm:gap-6 p-6 sm:p-10 md:p-12 lg:p-14" data-cursor="view">
        {SCREENS.map((screen) => (
          <img
            key={screen.src}
            src={screen.src}
            alt={screen.alt}
            width={628}
            height={1278}
            loading="lazy"
            className="w-[30%] sm:w-[28%] max-w-[190px] h-auto block"
          />
        ))}
      </div>
    </ProjectCardFrame>
  );
}

export default SurvueCard;
