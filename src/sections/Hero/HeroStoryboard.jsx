import { useEffect, useMemo, useRef } from "react";
import { animate } from "animejs";
import { useHeroScrollProgress } from "../../hooks/useHeroProgress";
import { STAGES } from "./heroStoryboard.data";
import { HERO_ART } from "./heroArt.data";

// Each stage's ~200-450 raw traced paths (potrace preserves no semantic
// grouping) were spatially clustered offline into 8 regions, roughly in
// reading order — see heroArt.data.js. In every one of the 5 stages, one
// of those 8 regions is a clear outlier: ~75-76M sq. units of bounding
// box vs. 2-14M for the rest, sitting at the exact same position and size
// every time (x=1190-1350, y=414-670, ~83% of the canvas width). That's
// the character-at-her-desk silhouette — the one thing every one of the
// 5 source illustrations has in common, drawn at the same "camera
// framing" each time. CHOREO below (computed once from getBBox() probes
// of the live SVG, not hand-measured) records which rank is that anchor
// per stage, plus a reveal order + wipe direction for the other 7 —
// sorted by distance from the anchor's own centroid, so the piece
// nearest her draws in first and the far corners follow, radiating
// outward, instead of an arbitrary left-to-right sweep.
//
// This is what makes the "one continuous drawing, not five swapped
// slides" illusion possible without inventing new artwork: the anchor
// region is the one thing that's honestly the same object across
// stages (same shape family, same spot), so it's the one thing allowed
// to cross-dissolve directly into its next-stage counterpart at a fixed
// screen position (see ANCHOR_OVERLAP below) — a real match-dissolve,
// not a swap. Everything else is stage-unique supporting detail (sticky
// notes, labels, UI chrome) with nothing to match across stages, so it
// gets a directional wipe-reveal instead: growing FROM the anchor's side
// outward, as if each detail is something she's adding, and retreating
// the same way before the next stage's dissolve arrives, clearing the
// stage for the handoff rather than being cut off mid-frame.
const CLUSTERS_PER_STAGE = 8;
const SECONDARY_COUNT = CLUSTERS_PER_STAGE - 1;

// The panel border and hand-lettered stage title ("DISCOVER", "DESIGN"...)
// were each traced as one connected fill region SHARING geometry with the
// character's own linework (potrace fuses touching ink into a single
// <path>, cancelling the shared area out via opposite winding direction —
// classic hollow-frame construction). Deleting that path's data to get
// rid of the border took chunks of her silhouette with it (confirmed:
// broke Design/Build/Refine/Ship). Clipping it out visually instead,
// rather than editing the traced data, sidesteps that entirely — the
// border sits at nearly identical coordinates in all 5 illustrations
// (getBBox() probes: x=1190, y=414-430, w=11621, h=6520-6536 in every
// stage), and every stage's real content (character + all supporting
// detail) sits safely inside that frame with 57-181 units of margin on
// every side, so a clip rect placed in that margin hides the border and
// the title above it — the title sits even further out, past the
// border's own top edge — without ever touching a single path.
const CLIP_X = 1220;
const CLIP_Y = 440;
const CLIP_WIDTH = 11500;
const CLIP_HEIGHT = 6440;

const CHOREO = {
  discover: { anchor: 3, order: [4, 5, 7, 1, 2, 6, 0], dir: { 0: "left", 1: "left", 2: "left", 4: "right", 5: "up", 6: "right", 7: "right" } },
  design: { anchor: 3, order: [5, 4, 1, 7, 6, 2, 0], dir: { 0: "left", 1: "left", 2: "left", 4: "up", 5: "right", 6: "right", 7: "right" } },
  build: { anchor: 5, order: [4, 3, 1, 2, 7, 6, 0], dir: { 0: "left", 1: "left", 2: "left", 3: "down", 4: "up", 6: "right", 7: "right" } },
  refine: { anchor: 3, order: [4, 6, 1, 5, 2, 7, 0], dir: { 0: "left", 1: "left", 2: "left", 4: "left", 5: "right", 6: "right", 7: "right" } },
  ship: { anchor: 4, order: [3, 5, 2, 7, 1, 6, 0], dir: { 0: "left", 1: "left", 2: "left", 3: "down", 5: "right", 6: "right", 7: "right" } },
};

// Secondary-cluster timeline, in local progress across a stage's own
// scroll window: 0.00-0.42 the supporting details wipe in one by one;
// 0.42-0.62 they hold, fully drawn; 0.62-1.00 they retreat the same way
// they arrived — well before the stage's own "to" boundary, so by the
// time the anchor's cross-dissolve into the next stage starts (see
// ANCHOR_OVERLAP), the periphery is already clear and the dissolve reads
// as a clean scene change, not a page cluttered on both sides.
const SEC_ENTER_END = 0.42;
const SEC_EXIT_START = 0.62;

// Half-width, in GLOBAL progress, of the cross-dissolve band centered on
// each boundary between two stages. Stage N's anchor ramps 1->0 and
// stage N+1's anchor ramps 0->1 across the *same* [boundary-OVERLAP,
// boundary+OVERLAP] window — not two independent fades that happen to
// land close together, but one dissolve both sides read off of, which is
// what keeps it from ever reading as a cut.
const ANCHOR_OVERLAP = 0.045;

// STEP_WIDTH is wider than an even 1/count share on purpose, so
// consecutive elements' ramps overlap and blend into each other instead
// of reading as discrete steps — but starts are spaced so element 0
// always begins exactly at seqLocal=0 and the last element always
// finishes exactly at seqLocal=1, however many elements there are. (A
// flat seqIndex/count spacing widened by a multiplier left the last
// element's own window ending past seqLocal=1 — a point the ramp can
// never reach — so it could never fully finish and left a permanent
// ghost behind.)
const STEP_WIDTH = 0.42;

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}
function smoothstep(t) {
  t = clamp01(t);
  return t * t * (3 - 2 * t);
}
// Entrance and exit deliberately use different easing shapes rather than
// one curve mirrored both ways — the asymmetry is what reads as ink
// arriving versus a sketch being wiped, instead of the same crossfade
// running in reverse. easeOutCubic front-loads the entrance (a piece
// rises quickly, then eases into place — decelerating into a stop, the
// way a pencil stroke settles) while easeInCubic holds each exiting piece
// nearly full-strength before releasing it fast at the very end (it lingers,
// then goes), rather than dissolving evenly the whole way through.
function easeOutCubic(t) {
  t = clamp01(t);
  const inv = 1 - t;
  return 1 - inv * inv * inv;
}
function easeInCubic(t) {
  t = clamp01(t);
  return t * t * t;
}
function staggerRamp(seqIndex, count, seqLocal, ease) {
  const start = count > 1 ? (seqIndex * (1 - STEP_WIDTH)) / (count - 1) : 0;
  const end = start + STEP_WIDTH;
  return ease((seqLocal - start) / (end - start));
}

// Every stage's supporting detail retreats the same way, SHIP included —
// letting it hold indefinitely once drawn in left process debris (an
// early sticky-note cluster, a crumpled-paper reject pile) permanently
// stuck on screen at the very bottom of the page, long after it stopped
// being relevant. Retiring it the same as every other stage leaves the
// true end of the scroll resting on SHIP's anchor alone — the character,
// not the scaffolding around her — right as the "View all works" CTA
// (Hero.jsx's own final beat) takes over as the page's actual close.
function secondaryOpacity(seqIndexIn, seqIndexOut, count, local) {
  if (local <= SEC_ENTER_END) {
    return staggerRamp(seqIndexIn, count, local / SEC_ENTER_END, easeOutCubic);
  }
  if (local < SEC_EXIT_START) return 1;
  const exitLocal = (local - SEC_EXIT_START) / (1 - SEC_EXIT_START);
  return 1 - staggerRamp(seqIndexOut, count, exitLocal, easeInCubic);
}

// A directional reveal instead of a flat fade: the piece is clipped down
// to a sliver on its anchor-facing edge and grows outward from there as
// `span` (the same 0..1 value driving opacity) advances — reads as the
// detail extending out from the main figure rather than materializing
// in place. `span` also drives the retreat (it runs the ramp above
// backwards), so the piece closes back along the same edge it grew from
// rather than vanishing somewhere else on exit.
function clipInsetFor(dir, span) {
  const hidden = (1 - clamp01(span)) * 100;
  switch (dir) {
    case "right":
      return `inset(0% ${hidden}% 0% 0%)`;
    case "left":
      return `inset(0% 0% 0% ${hidden}%)`;
    case "down":
      return `inset(0% 0% ${hidden}% 0%)`;
    case "up":
      return `inset(${hidden}% 0% 0% 0%)`;
    default:
      return "none";
  }
}

// The anchor's own opacity, computed straight from GLOBAL progress
// (never localized to one stage's own from/to window the way secondary
// clusters are) precisely so it CAN bleed across a stage boundary. Stays
// at full strength through its stage's own core, and only ramps where it
// borders a neighbor — 0->1 easing in across the boundary shared with
// the previous stage, 1->0 easing out across the boundary shared with
// the next. The first stage has no previous neighbor to fade in from
// (opens already resting, fully present); the last has no next neighbor
// to fade into (ends resting, fully present) — see ANCHOR_OVERLAP.
function anchorOpacity(stageIndex, progress) {
  const s = STAGES[stageIndex];
  let entering = 1;
  let exiting = 1;
  if (stageIndex > 0) {
    const b = s.from;
    entering = smoothstep((progress - (b - ANCHOR_OVERLAP)) / (2 * ANCHOR_OVERLAP));
  }
  if (stageIndex < STAGES.length - 1) {
    const b = s.to;
    exiting = 1 - smoothstep((progress - (b - ANCHOR_OVERLAP)) / (2 * ANCHOR_OVERLAP));
  }
  return Math.min(entering, exiting);
}

export default function HeroStoryboard({ wrapperRef, reduced }) {
  const paperRefs = useRef({});
  const clusterRefs = useRef({});
  const accentLayerRef = useRef(null);
  const accentCircleRef = useRef(null);
  const accentUnderlineRef = useRef(null);
  const accentAnims = useRef({ circle: null, underline: null });

  // Two restrained Anime.js jobs: the hand-drawn accent strokes over
  // DISCOVER's "USER NEED" call-out drawing themselves in, via a real
  // stroke-dashoffset animation rather than an opacity fade. Non-
  // autoplaying and seek-controlled, so they stay reversible with the
  // scrollbar like everything else here.
  useEffect(() => {
    if (reduced) return;
    [
      { ref: accentCircleRef, key: "circle" },
      { ref: accentUnderlineRef, key: "underline" },
    ].forEach(({ ref, key }) => {
      const el = ref.current;
      if (!el) return;
      const length = el.getTotalLength();
      el.style.strokeDasharray = String(length);
      accentAnims.current[key] = animate(el, {
        strokeDashoffset: [length, 0],
        autoplay: false,
        duration: 1000,
        ease: "linear",
      });
    });
    return () => {
      accentAnims.current.circle?.revert();
      accentAnims.current.underline?.revert();
    };
  }, [reduced]);

  const applyProgress = useMemo(
    () => (progress) => {
      STAGES.forEach((s, i) => {
        const choreo = CHOREO[s.key];
        const local = clamp01((progress - s.from) / (s.to - s.from));

        const anchorEl = clusterRefs.current[s.key]?.[choreo.anchor];
        if (anchorEl) anchorEl.style.opacity = String(anchorOpacity(i, progress));

        const paperEl = paperRefs.current[s.key];
        if (paperEl) paperEl.style.opacity = String(anchorOpacity(i, progress));

        choreo.order.forEach((rank, seqIndexIn) => {
          const el = clusterRefs.current[s.key]?.[rank];
          if (!el) return;
          const seqIndexOut = SECONDARY_COUNT - 1 - seqIndexIn;
          const span = secondaryOpacity(seqIndexIn, seqIndexOut, SECONDARY_COUNT, local);
          el.style.opacity = String(span);
          el.style.clipPath = clipInsetFor(choreo.dir[rank], span);
        });
      });

      // The accent draws in once discover's nearby detail has mostly
      // arrived (matching SEC_ENTER_END's pace) and retreats alongside
      // it too, rather than running on its own separate schedule.
      const circleAnim = accentAnims.current.circle;
      const underlineAnim = accentAnims.current.underline;
      circleAnim?.seek(clamp01(progress / 0.1) * 1000);
      underlineAnim?.seek(clamp01((progress - 0.02) / 0.1) * 1000);

      const discoverLocal = clamp01(progress / STAGES[0].to);
      if (accentLayerRef.current) {
        accentLayerRef.current.style.opacity = String(
          secondaryOpacity(0, SECONDARY_COUNT - 1, SECONDARY_COUNT, discoverLocal)
        );
      }
    },
    []
  );

  useHeroScrollProgress(wrapperRef, applyProgress, { disabled: reduced });

  // Reduced motion: a fixed, fully-drawn SHIP frame — no scroll-scrubbing,
  // no Anime.js instances above, no clip-path wipes. Non-reduced starts
  // every stage's secondary detail fully blank, matching progress=0 —
  // the page opens on just discover's anchor (the character), with every
  // supporting piece still to be drawn in as the user starts scrolling,
  // not a scene that's already partway assembled before they've touched
  // the wheel.
  return (
    <div
      className="hero-storyboard w-full max-w-md mx-auto mt-4 lg:mt-0 lg:mx-0 lg:max-w-none lg:w-[60%] lg:shrink-0 aspect-[1400/764] lg:aspect-auto lg:h-[78vh] xl:h-[82vh]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 1400 764" className="block w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id="hero-storyboard-frame" clipPathUnits="userSpaceOnUse">
            <rect x={CLIP_X} y={CLIP_Y} width={CLIP_WIDTH} height={CLIP_HEIGHT} />
          </clipPath>
        </defs>
        <rect x="0" y="0" width="1400" height="764" className="stage-paper" />

        {STAGES.map((s, i) => {
          const clusters = HERO_ART[s.key];
          const choreo = CHOREO[s.key];
          const last = i === STAGES.length - 1;
          const paperInit = reduced ? (last ? 1 : 0) : i === 0 ? 1 : 0;
          return (
            <g key={s.key}>
              <rect
                ref={(el) => (paperRefs.current[s.key] = el)}
                x="0"
                y="0"
                width="1400"
                height="764"
                className="stage-paper"
                style={{ opacity: paperInit }}
              />
              <g transform="translate(0,764) scale(0.1,-0.1)" clipPath="url(#hero-storyboard-frame)">
                {clusters.map((clusterPaths, rank) => {
                  const isAnchor = rank === choreo.anchor;
                  let clusterInit;
                  let clipInit;
                  if (reduced) {
                    clusterInit = last ? 1 : 0;
                    clipInit = "none";
                  } else if (isAnchor) {
                    // Matches anchorOpacity(i, 0): only discover's anchor
                    // (the character) is present before any scroll.
                    clusterInit = i === 0 ? 1 : 0;
                    clipInit = "none";
                  } else {
                    // Every supporting piece — including discover's —
                    // starts fully undrawn, so the resting page shows just
                    // the character and nothing else yet to add.
                    clusterInit = 0;
                    clipInit = clipInsetFor(choreo.dir[rank], 0);
                  }
                  return (
                    <g
                      key={rank}
                      ref={(el) => {
                        if (!clusterRefs.current[s.key]) clusterRefs.current[s.key] = [];
                        clusterRefs.current[s.key][rank] = el;
                      }}
                      style={{ opacity: clusterInit, clipPath: clipInit }}
                    >
                      {clusterPaths.map((d, pi) => (
                        <path key={pi} d={d} />
                      ))}
                    </g>
                  );
                })}
              </g>
            </g>
          );
        })}

        <g ref={accentLayerRef} style={{ opacity: reduced ? 0 : 1 }}>
          <path
            ref={accentCircleRef}
            className="accent-path"
            d="M598 118c-6 -24 -34 -34 -56 -24c-24 11 -30 44 -12 62c19 19 55 15 66 -10c4 -9 5 -19 2 -28"
          />
          <path ref={accentUnderlineRef} className="accent-path" d="M182 168c40 6 82 7 122 2" />
        </g>
      </svg>
    </div>
  );
}
