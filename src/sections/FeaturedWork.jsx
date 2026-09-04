import { useScrollReveal } from "../hooks/useScrollReveal";
import { work } from "../data/work";
import { QalinPaperCard } from "../components/work/QalinPaperCard";
import { HaoqiProjectCard } from "../components/work/HaoqiProjectCard";
import { QuillPigeonCard } from "../components/work/QuillPigeonCard";
import { SurvueCard } from "../components/work/SurvueCard";
import { RelayCard } from "../components/work/RelayCard";

// The full project list, shown on Home as haoqi.design-style flat cards
// (ProjectCardFrame) — there's no separate "/work" page anymore, this is
// the only place all of it lives. SupportIQ leads: it's the strongest
// full-stack "designs and ships code" evidence on the site, and a "Design
// Engineer" pitch is weaker if the first thing shown is a Figma-only
// project. Grouped into rows rather than a flat list so Qalin can sit
// beside SupportIQ, sharing one row, while some others stay solo.
//
// `width` caps the row itself (default: a solo card's own half-width, a
// pair's full row); `stackOnMobile` (default true) controls whether a
// pair drops to one-per-line on narrow screens or stays side by side —
// the Get Campus row keeps its pair side by side even on mobile, unlike
// the SupportIQ/Qalin one.
const FEATURED_ROWS = [
  { ids: ["supportiq", "qalin"] },
  { ids: ["relay"], width: "md:w-[85%]", align: "right" },
  // New Start Mobile has no case study or screenshots yet (only a
  // one-line mention inside the Get Campus case study), so its card has
  // no preview image — just the color block, tag, name, and date, same as
  // Wildwood's text-only treatment elsewhere on the site.
  //
  // stackOnMobile: false is intentional — this pair stays side by side on
  // phones by design, unlike every other paired row. That does mean each
  // card is narrow at small viewports (~119-187px measured at 375-430px);
  // accepted as the deliberate tradeoff for keeping the pair side by side.
  { ids: ["get-campus", "new-start-mobile"], width: "md:w-[75%]", stackOnMobile: false },
  { ids: ["quill-pigeon"], width: "md:w-[85%]", align: "right" },
  { ids: ["survue"], width: "md:w-full" },
  // Wildwood has no screenshots (see preview: "none" in work.js) — same
  // text-only treatment as New Start Mobile above: color block, tag,
  // name, date only.
  { ids: ["wildwood"], align: "center" },
];

const CARD_COMPONENTS = {
  qalin: QalinPaperCard,
  "quill-pigeon": QuillPigeonCard,
  survue: SurvueCard,
  relay: RelayCard,
};

function FeaturedCard({ project }) {
  const Card = CARD_COMPONENTS[project.id] || HaoqiProjectCard;
  return <Card project={project} />;
}

function FeaturedWorkHeading() {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className="reveal">
      {/* No border-t here — the hero fades directly into this section's
          background via .hero-fade-bottom (see Hero.jsx/index.css), so a
          hard rule right at that seam would recreate the sharp edge the
          fade exists to remove. */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-24 md:pt-36 pb-16 md:pb-20">
        <div className="flex items-center gap-3 mb-8">
          <span className="block h-px w-6 bg-accent-secondary divider-draw" aria-hidden="true" />
          <p className="text-xs tracking-eyebrow uppercase text-text-secondary">Selected Work</p>
        </div>
        <h2 id="featured-work-heading" className="text-4xl md:text-6xl text-text leading-[1.05] max-w-2xl">
          A few things I've designed and built
        </h2>
      </div>
    </div>
  );
}

export default function FeaturedWork() {
  const rows = FEATURED_ROWS.map((row) => ({
    ...row,
    projects: row.ids.map((id) => work.find((p) => p.id === id)).filter(Boolean),
  })).filter((row) => row.projects.length > 0);

  return (
    <section id="featured-work" aria-labelledby="featured-work-heading" className="pb-28 md:pb-40">
      <FeaturedWorkHeading />
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex flex-col gap-2">
        {rows.map(({ projects, width, align, stackOnMobile = true }) =>
          projects.length === 1 ? (
            <div
              key={projects[0].id}
              className={`${width || "md:w-1/2"} ${
                align === "right" ? "md:ml-auto" : align === "center" ? "md:mx-auto" : ""
              }`}
            >
              <FeaturedCard project={projects[0]} />
            </div>
          ) : (
            <div
              key={projects.map((p) => p.id).join("-")}
              className={`flex ${stackOnMobile ? "flex-col md:flex-row" : "flex-row"} gap-2 md:gap-16 ${width || ""}`}
            >
              {projects.map((project) => (
                <div key={project.id} className="flex-1">
                  <FeaturedCard project={project} />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </section>
  );
}
