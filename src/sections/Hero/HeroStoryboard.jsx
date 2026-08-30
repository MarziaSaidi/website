import { useEffect, useMemo, useRef } from "react";
import { animate } from "animejs";
import { useHeroScrollProgress } from "../../hooks/useHeroProgress";
import { STAGES } from "./heroStoryboard.data";
import { HERO_ART } from "./heroArt.data";

// Each stage's ~200-450 raw traced paths (potrace preserves no semantic
// grouping) were spatially clustered offline into 8 regions, roughly in
// reading order — see heroArt.data.js. That's what makes a genuine
// "piece by piece" reveal possible: ~9 opacity writes per stage per
// scroll frame (paper + 8 clusters), not one per path.
const CLUSTERS_PER_STAGE = 8;

// Per-stage timeline, in local progress (0..1 across that stage's own
// scroll window): 0.00-0.60 the page and its 8 regions draw in one by
// one; 0.60-0.85 it sits there, finished; 0.85-1.00 the content (not the
// page itself — the next stage's own page covers it) retires the same
// staggered way, handing off to whatever draws in next.
const ENTER_END = 0.6;
const EXIT_START = 0.85;

// STEP_WIDTH is wider than an even 1/count share on purpose, so
// consecutive elements' fades overlap and blend into each other instead
// of reading as discrete steps — but starts are spaced so element 0
// always begins exactly at seqLocal=0 and the last element always
// finishes exactly at seqLocal=1, however many elements there are. (A
// flat seqIndex/count spacing widened by a multiplier left the last
// element's own window ending past seqLocal=1 — a point the ramp can
// never reach — so it could never fully finish fading and left a
// permanent ghost behind.)
const STEP_WIDTH = 0.34;

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}
function smoothstep(t) {
  t = clamp01(t);
  return t * t * (3 - 2 * t);
}
function staggerRamp(seqIndex, count, seqLocal) {
  const start = count > 1 ? (seqIndex * (1 - STEP_WIDTH)) / (count - 1) : 0;
  const end = start + STEP_WIDTH;
  return smoothstep((seqLocal - start) / (end - start));
}
function paperOpacity(local) {
  if (local <= ENTER_END) return staggerRamp(0, CLUSTERS_PER_STAGE + 1, local / ENTER_END);
  return 1;
}
function clusterOpacity(rank, local) {
  if (local <= ENTER_END) return staggerRamp(rank + 1, CLUSTERS_PER_STAGE + 1, local / ENTER_END);
  if (local < EXIT_START) return 1;
  const exitLocal = (local - EXIT_START) / (1 - EXIT_START);
  return 1 - staggerRamp(rank, CLUSTERS_PER_STAGE, exitLocal);
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
        let local = clamp01((progress - s.from) / (s.to - s.from));
        // The very first frame of the very first stage is the page's
        // resting, pre-scroll state — start partway into its own
        // entrance rather than fully blank before any scroll happens.
        if (i === 0) local = Math.max(local, 0.22);
        const paperEl = paperRefs.current[s.key];
        if (paperEl) paperEl.style.opacity = String(paperOpacity(local));
        const clusters = clusterRefs.current[s.key] || [];
        clusters.forEach((el, rank) => {
          if (el) el.style.opacity = String(clusterOpacity(rank, local));
        });
      });

      const circleAnim = accentAnims.current.circle;
      const underlineAnim = accentAnims.current.underline;
      circleAnim?.seek(clamp01(progress / 0.14) * 1000);
      underlineAnim?.seek(clamp01((progress - 0.02) / 0.14) * 1000);

      // The accent layer sits over the DISCOVER frame specifically —
      // fades out alongside DISCOVER's own content retiring.
      const discoverLocal = clamp01(progress / STAGES[0].to);
      if (accentLayerRef.current) {
        accentLayerRef.current.style.opacity =
          discoverLocal < EXIT_START ? "1" : String(1 - smoothstep((discoverLocal - EXIT_START) / (1 - EXIT_START)));
      }
    },
    []
  );

  useHeroScrollProgress(wrapperRef, applyProgress, { disabled: reduced });

  // Reduced motion: a fixed, fully-drawn SHIP frame — no scroll-scrubbing,
  // no Anime.js instances above. Non-reduced starts each stage's paper/
  // clusters already reflecting local=0 (blank) except discover, which
  // JSX seeds partway into its own entrance to match the floor above and
  // avoid a blank flash before the first scroll-driven frame lands.
  return (
    <div
      className="hero-storyboard w-full max-w-md mx-auto mt-14 lg:mt-0 lg:mx-0 lg:max-w-none lg:w-[60%] lg:shrink-0 h-[58vh] sm:h-[64vh] lg:h-[78vh] xl:h-[82vh]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 1400 764" className="block w-full h-full" preserveAspectRatio="xMidYMid meet">
        <rect x="0" y="0" width="1400" height="764" className="stage-paper" />

        {STAGES.map((s, i) => {
          const clusters = HERO_ART[s.key];
          const last = i === STAGES.length - 1;
          const paperInit = reduced ? (last ? 1 : 0) : i === 0 ? Math.min(1, staggerRampInit(0)) : 0;
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
              <g transform="translate(0,764) scale(0.1,-0.1)">
                {clusters.map((clusterPaths, rank) => {
                  const clusterInit = reduced ? (last ? 1 : 0) : i === 0 ? Math.min(1, staggerRampInit(rank + 1)) : 0;
                  return (
                    <g
                      key={rank}
                      ref={(el) => {
                        if (!clusterRefs.current[s.key]) clusterRefs.current[s.key] = [];
                        clusterRefs.current[s.key][rank] = el;
                      }}
                      style={{ opacity: clusterInit }}
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

// Mirrors the entrance stagger math above, used only for the JSX-authored
// initial opacity (discover stage at the same 0.22 floor applyProgress
// uses) so the very first paint already matches what the scroll hook
// would compute a tick later — no flash from blank to partial.
function staggerRampInit(seqIndex) {
  return staggerRamp(seqIndex, CLUSTERS_PER_STAGE + 1, 0.22 / ENTER_END);
}
