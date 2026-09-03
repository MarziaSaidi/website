import { useMemo, useState } from "react";
import { SiFigma, SiReact, SiGit } from "react-icons/si";
import {
  LuMousePointer2,
  LuFrame,
  LuLayers,
  LuCode,
  LuTerminal,
  LuMouse,
  LuPointer,
  LuSmartphone,
  LuMonitor,
  LuTablet,
  LuPresentation,
} from "react-icons/lu";

// Simple Icons dropped Adobe's marks (trademark reasons), so Adobe XD is
// the one hand-drawn glyph here — same stroke weight/style as the Lucide
// icons around it (viewBox 24, strokeWidth 2, round caps), colored via
// XD_PINK below rather than currentColor since it needs its own brand hue.
function AdobeXdGlyph(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M7.5 8.5l4 7M11.5 8.5l-4 7" />
      <circle cx="16.5" cy="13.5" r="2.5" />
      <path d="M19 7.5v8.5" />
    </svg>
  );
}

// react-icons' Si set renders brand marks as a single currentColor glyph,
// which is right for a monochrome mark like Git's but wrong for Figma's —
// its whole identity is 5 differently-colored pieces. Hand-drawn here with
// each piece's own official fill so it doesn't get flattened to one hue.
function FigmaGlyph(props) {
  return (
    <svg viewBox="0 0 24 36" {...props}>
      <path fill="#F24E1E" d="M0 6a6 6 0 0 1 6-6h6v12H6A6 6 0 0 1 0 6Z" />
      <path fill="#FF7262" d="M12 0h6a6 6 0 1 1 0 12h-6V0Z" />
      <path fill="#A259FF" d="M6 12h6v12H6a6 6 0 1 1 0-12Z" />
      <circle fill="#1ABCFE" cx="18" cy="18" r="6" />
      <path fill="#0ACF83" d="M6 24h6v6a6 6 0 1 1-6-6Z" />
    </svg>
  );
}

// Brand-identifiable tools get their own real color; the rest are fixed
// black regardless of theme (not the adaptive neutral text color — a
// plain cursor or frame icon has no brand identity to preserve, but
// "black" was specifically asked for, not "whatever shade of gray the
// current theme's secondary text happens to be").
const BLACK = "#000000";
const ICON_SET = [
  { Icon: FigmaGlyph, color: null }, // multi-color piece fills, ignores color entirely
  { Icon: LuMousePointer2, color: BLACK },
  { Icon: LuFrame, color: BLACK },
  { Icon: LuLayers, color: BLACK },
  { Icon: LuCode, color: BLACK },
  { Icon: LuTerminal, color: BLACK },
  { Icon: SiGit, color: "#F05033" }, // Git's own brand orange, not GitHub's black octocat
  { Icon: LuMouse, color: BLACK },
  { Icon: LuPointer, color: BLACK },
  { Icon: SiReact, color: "#61DAFB" },
  { Icon: AdobeXdGlyph, color: "#FF61F6" },
  { Icon: LuSmartphone, color: BLACK },
  { Icon: LuMonitor, color: BLACK },
  { Icon: LuTablet, color: BLACK },
  { Icon: LuPresentation, color: BLACK },
];

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function usePrefersReducedMotion() {
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  return reduced;
}

// Ambient background rain of tool icons behind the hero copy — every icon
// is its own independent loop (own size, delay, fall duration, drift and
// rotation), not a single choreographed sequence, so the piece never
// settles into a visible rhythm. Shuffling ICON_SET before assigning
// those values (rather than mapping it in its fixed declaration order)
// is what keeps which icon sits in which delay slot from being the same
// on every load. Different-enough durations per icon also mean their
// relative order keeps drifting over time instead of the same icon
// always leading — true non-repetition would need re-randomizing on
// every CSS animation loop, which isn't worth the added JS for a
// background flourish this quiet.
export default function FallingIcons() {
  const reduced = usePrefersReducedMotion();

  const icons = useMemo(() => {
    return shuffled(ICON_SET).map(({ Icon, color }, i) => {
      const size = randomBetween(16, 30);
      const rotateFrom = randomBetween(-40, 40);
      // Some icons barely turn, others make a slow half-to-full tumble —
      // varying the total sweep (not just the start angle) is what reads
      // as different rotation SPEEDS given every icon shares one timeline.
      const rotateTo = rotateFrom + (Math.random() < 0.5 ? -1 : 1) * randomBetween(50, 320);
      return {
        Icon,
        color,
        id: i,
        left: randomBetween(2, 98),
        duration: randomBetween(15, 27),
        delay: randomBetween(-18, 4),
        size,
        rotateFrom,
        rotateTo,
        drift: randomBetween(-70, 70),
        // High and narrow on purpose — full brand color needs real
        // presence to actually read as Figma/React/Git/XD rather than
        // just another gray smudge; this is depth-of-field variance,
        // not the wash-it-all-out opacity treatment that was here before.
        opacity: randomBetween(0.75, 1),
      };
    });
  }, []);

  if (reduced) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {icons.map(({ Icon, color, id, left, duration, delay, size, rotateFrom, rotateTo, drift, opacity }) => (
        <Icon
          key={id}
          className={`hero-falling-icon${color ? "" : " text-text-secondary"}`}
          style={{
            left: `${left}%`,
            width: size,
            height: size,
            color: color ?? undefined,
            "--fall-duration": `${duration}s`,
            "--fall-delay": `${delay}s`,
            "--rotate-from": `${rotateFrom}deg`,
            "--rotate-to": `${rotateTo}deg`,
            "--drift-x": `${drift}px`,
            "--icon-opacity": opacity,
          }}
        />
      ))}
    </div>
  );
}
