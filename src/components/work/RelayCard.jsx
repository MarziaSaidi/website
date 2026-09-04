import { ProjectCardFrame } from "./ProjectCardFrame";

// Relay's card content: three real screens from the dispatch console, same
// collage template as QuillPigeonCard — one large screen on the left
// (~57% width) sized so the row's own aspect-ratio matches it exactly
// (zero crop), and two more stacked on the right (~43%), splitting that
// height evenly since all three screenshots share the same 2880x1800
// aspect ratio this time. All three use object-contain (never cropped).
//
// Padding here (p-3 sm:p-4 md:p-5) is intentionally tighter than the
// single-preview cluster cards' p-6 sm:p-10 md:p-12 lg:p-14 (see
// ProjectCardFrame/QalinPaperCard/SurvueCard): ROW_ASPECT below is a
// fixed aspect-ratio box derived directly from the screenshots' own
// dimensions, and padding is subtracted from that fixed box before the
// three images get their share of it. The cluster scale would eat
// visibly into three-image real estate that's already split three ways;
// this scale is the one that keeps each screenshot legible. Not an
// inconsistency — it's load-bearing for this card's own math.
const IMG_BASE = "/relay";
const LEFT_ASPECT = 2880 / 1800; // shared by all three Relay screenshots
const LEFT_SHARE = 1.33 / (1.33 + 1); // left column's share of the row width
const HEIGHT_BOOST = 1.35; // >1 makes the row taller than the natural fit
const ROW_ASPECT = LEFT_ASPECT / LEFT_SHARE / HEIGHT_BOOST;

export function RelayCard({ project }) {
  return (
    <ProjectCardFrame project={project} color={project.cardColor || "#000000"}>
      <div className="flex gap-0.5 p-3 sm:p-4 md:p-5" style={{ aspectRatio: ROW_ASPECT }} data-cursor="view">
        <img
          src={`${IMG_BASE}/dispatch-overview.webp`}
          alt="Relay's live dispatch overview console"
          loading="lazy"
          className="h-full min-w-0 object-contain object-center"
          style={{ flex: "1.33 1.33 0%" }}
        />
        <div className="flex flex-col gap-1.5 h-full min-w-0" style={{ flex: "1 1 0%" }}>
          <img
            src={`${IMG_BASE}/order-assignment.webp`}
            alt="Relay's order assignment panel with ranked suggested drivers"
            loading="lazy"
            className="w-full min-h-0 object-contain object-center"
            style={{ flex: "1 1 0%" }}
          />
          <img
            src={`${IMG_BASE}/driver-detail.webp`}
            alt="Relay's driver detail view with route stops and shift timeline"
            loading="lazy"
            className="w-full min-h-0 object-contain object-center"
            style={{ flex: "1 1 0%" }}
          />
        </div>
      </div>
    </ProjectCardFrame>
  );
}

export default RelayCard;
