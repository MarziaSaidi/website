import { ProjectCardFrame } from "./ProjectCardFrame";

// Quill & Pigeon's card content: three real screenshots from the import
// flow (not the shared single-banner treatment other projects use). Image 1
// (the "Add Recipients" step, empty state) sets the shape: the row's own
// aspect-ratio starts from an exact match to image 1 at its ~57% width
// share, then HEIGHT_BOOST makes the whole row taller than that on purpose
// for a card that reads as a proper flagship row instead of a thin strip.
// All three screenshots use object-contain (never cropped) — the extra
// room HEIGHT_BOOST adds just shows as more black card around each one.
// The right column (~43%) stretches to match and splits evenly between
// the two import-modal screenshots.
const IMG_BASE = "/quill%20and%20pigeon";
const IMG1_ASPECT = 2880 / 1558; // image 1's own natural ratio
const LEFT_SHARE = 1.33 / (1.33 + 1); // left column's share of the row width
const HEIGHT_BOOST = 1.35; // >1 makes the row taller than image 1's natural fit
const ROW_ASPECT = IMG1_ASPECT / LEFT_SHARE / HEIGHT_BOOST;
// The right column's two cells split its height in proportion to each
// image's own aspect ratio (taller/narrower image 4 gets a taller cell
// than wide/short image 5) — equal 50/50 cells left image 4 with a much
// bigger empty margin than image 5 got, since neither cell matched its
// image's real shape.
//
// Padding here (p-3 sm:p-4 md:p-5), like RelayCard's, is intentionally
// tighter than the cluster cards' p-6 sm:p-10 md:p-12 lg:p-14 — it's
// subtracted from the fixed ROW_ASPECT box below before three images
// split what's left, so the cluster scale would visibly shrink each
// screenshot. Load-bearing for this card's layout, not drift.
const IMG5_ASPECT = 2048 / 722;
const IMG4_ASPECT = 2042 / 1190;

export function QuillPigeonCard({ project }) {
  return (
    <ProjectCardFrame project={project} color={project.cardColor || "#000000"}>
      <div className="flex gap-0.5 p-3 sm:p-4 md:p-5" style={{ aspectRatio: ROW_ASPECT }} data-cursor="view">
        <img
          src={`${IMG_BASE}/1.png`}
          alt="Quill & Pigeon's Add Recipients step, empty state"
          loading="lazy"
          className="h-full min-w-0 object-contain object-center"
          style={{ flex: "1.33 1.33 0%" }}
        />
        <div className="flex flex-col gap-1.5 h-full min-w-0" style={{ flex: "1 1 0%" }}>
          <img
            src={`${IMG_BASE}/5.png`}
            alt="Quill & Pigeon's import review modal with two clean rows"
            loading="lazy"
            className="w-full min-h-0 object-contain object-center"
            style={{ flex: `${1 / IMG5_ASPECT} ${1 / IMG5_ASPECT} 0%` }}
          />
          <img
            src={`${IMG_BASE}/4.png`}
            alt="Quill & Pigeon's import review modal flagging duplicate rows"
            loading="lazy"
            className="w-full min-h-0 object-contain object-center"
            style={{ flex: `${1 / IMG4_ASPECT} ${1 / IMG4_ASPECT} 0%` }}
          />
        </div>
      </div>
    </ProjectCardFrame>
  );
}

export default QuillPigeonCard;
