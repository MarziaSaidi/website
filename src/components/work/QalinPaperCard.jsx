import { ProjectCardFrame } from "./ProjectCardFrame";

// Qalin's card content: three real screens from the prototype side by
// side, arranged so no two of them ever overlap — a loose fan (alternating
// rotation + vertical offset) instead of a stacked "hero phone in front"
// cluster. The surrounding chrome (color block, corner tag, name/date
// caption) is ProjectCardFrame, shared with every other featured card.
const SCREENS = [
  { src: "/qalin/Home.webp", alt: "Qalin home screen with a featured hand knotted rug", rotate: -6, offset: "mt-6 sm:mt-10" },
  { src: "/qalin/3.webp", alt: "Qalin's Instagram follow section with a styled room photo", rotate: 4, offset: "mt-0" },
  { src: "/qalin/6.webp", alt: "A Bakhtiari rug's product detail page with an add to basket button", rotate: -3, offset: "mt-14 sm:mt-20" },
];

export function QalinPaperCard({ project }) {
  return (
    <ProjectCardFrame project={project} color="#FEE1E1">
      <div
        className="group/cluster flex items-start justify-center gap-4 sm:gap-6 p-6 sm:p-10 md:p-12 lg:p-14"
        data-cursor="view"
      >
        {SCREENS.map((screen) => (
          <div
            key={screen.src}
            className={`relative w-[30%] sm:w-[28%] max-w-[190px] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cluster:-translate-y-1 ${screen.offset}`}
            style={{
              transform: `rotate(${screen.rotate}deg)`,
              filter:
                "drop-shadow(-4px 10px 8px rgba(30,26,20,0.22)) drop-shadow(-10px 22px 20px rgba(30,26,20,0.2))",
            }}
          >
            <img src={screen.src} alt={screen.alt} width={633} height={1280} loading="lazy" className="block w-full h-auto" />
          </div>
        ))}
      </div>
    </ProjectCardFrame>
  );
}

export default QalinPaperCard;
