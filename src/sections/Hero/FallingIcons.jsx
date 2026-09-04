import { useEffect, useMemo, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
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
import { cursorField, ensureCursorFieldTracking } from "../../hooks/useCursorField";
import SoftBodyMesh from "./SoftBodyMesh";

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
// its own fixed color regardless of theme (not the adaptive neutral text
// color — a plain cursor or frame icon has no brand identity to preserve,
// but a real accent color was specifically asked for, not "whatever
// shade of gray the current theme's secondary text happens to be").
// The generic (non-brand) hexes below correspond to index.css's
// --color-icon-purple/-lavender/-light/-coral/-pink tokens — kept as
// literal hex here rather than var() because these get rasterized into a
// detached (not-in-document) SVG string for a WebGL texture, which can't
// resolve a live CSS custom property. They stay fixed across light/dark,
// matching the rest of the hero's own always-on composition.
const ICON_SET = [
  { Icon: FigmaGlyph, color: null }, // multi-color piece fills, ignores color entirely
  { Icon: LuMousePointer2, color: "#5849BC" },
  { Icon: LuFrame, color: "#8B7FE8" },
  { Icon: LuLayers, color: "#A49AFF" },
  { Icon: LuCode, color: "#FF6B61" },
  { Icon: LuTerminal, color: "#D98BFF" },
  { Icon: SiGit, color: "#F05033" }, // Git's own brand orange, not GitHub's black octocat
  { Icon: LuMouse, color: "#FF8278" },
  { Icon: LuPointer, color: "#8B7FE8" },
  { Icon: SiReact, color: "#61DAFB" },
  { Icon: AdobeXdGlyph, color: "#FF61F6" },
  { Icon: LuSmartphone, color: "#A49AFF" },
  { Icon: LuMonitor, color: "#5849BC" },
  { Icon: LuTablet, color: "#D98BFF" },
  { Icon: LuPresentation, color: "#FF6B61" },
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
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  return reduced;
}

// 10x10 per icon (smaller than a single standalone icon would use, since
// 15 of these now share one CPU-side physics loop each frame) — still
// enough subdivisions to read as a continuous membrane at icon scale.
const GRID = 10;
const INFLUENCE = 2.2; // cursor influence radius, as a multiple of the icon's own size

// R3F's `camera` prop on <Canvas> only reliably configures the camera
// ONCE, at creation — passing a new {left, right, top, bottom} object on
// every render (as we do below, since sceneSize.w/h changes on window
// resize) isn't guaranteed to update an already-constructed orthographic
// camera's frustum. Explicitly syncing it (and calling
// updateProjectionMatrix) whenever width/height actually change is the
// reliable fix — see the same comment in SoftBodyMarzia.jsx.
function CameraSync({ width, height }) {
  const { camera } = useThree();
  useEffect(() => {
    camera.left = 0;
    camera.right = width;
    camera.top = 0;
    camera.bottom = height;
    camera.near = 0.1;
    camera.far = 1000;
    camera.position.set(0, 0, 100);
    camera.updateProjectionMatrix();
  }, [camera, width, height]);
  return null;
}

// Rasterizes the icon (react-icons component or the hand-drawn glyphs
// above) into a THREE.CanvasTexture — same "serialize the real rendered
// SVG" approach used for MARZIA (see SoftBodyMarzia.jsx).
function useIconTexture(Icon, color, sourcePx) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const markup = renderToStaticMarkup(<Icon width={sourcePx} height={sourcePx} color={color ?? undefined} />);
    const img = new window.Image();
    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = sourcePx;
      canvas.height = sourcePx;
      canvas.getContext("2d").drawImage(img, 0, 0, sourcePx, sourcePx);
      // No colorSpace tag here on purpose — see the <Canvas linear> prop
      // below: a custom ShaderMaterial doesn't get Three.js's automatic
      // sRGB texture decode, so tagging the texture sRGB while the
      // renderer ALSO re-encodes its output double-applies the gamma
      // curve and visibly shifts brand colors (Git orange, React cyan,
      // XD pink). Leaving both untagged keeps it a straight pass-through.
      const tex = new THREE.CanvasTexture(canvas);
      setTexture(tex);
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    return () => {
      cancelled = true;
    };
  }, [Icon, color, sourcePx]);
  return texture;
}

// Samples the same waypoints the CSS @keyframes hero-icon-fall used to
// drive directly (see git history / index.css): position + rotation
// piecewise-linear across 0% / 50% / 100%, opacity piecewise-linear
// across 0% / 8% / 90% / 100%. Evaluated in JS every frame instead of by
// the browser's own CSS animation engine, since these are WebGL meshes
// now (needed for the soft-body deformation), not DOM elements a CSS
// animation could drive directly.
function sampleFall(t, { rotateFrom, rotateTo, driftX, opacity, viewportH }) {
  const lerp = (a, b, u) => a + (b - a) * u;
  let x;
  let yVh;
  let rot;
  if (t <= 0.5) {
    const u = t / 0.5;
    x = lerp(0, driftX * 0.5, u);
    yVh = lerp(-14, 55, u);
    rot = lerp(rotateFrom, (rotateFrom + rotateTo) / 2, u);
  } else {
    const u = (t - 0.5) / 0.5;
    x = lerp(driftX * 0.5, driftX, u);
    yVh = lerp(55, 122, u);
    rot = lerp((rotateFrom + rotateTo) / 2, rotateTo, u);
  }
  let op;
  if (t <= 0.08) op = lerp(0, opacity, t / 0.08);
  else if (t <= 0.9) op = opacity;
  else op = lerp(opacity, 0, (t - 0.9) / 0.1);
  return { x, y: (yVh / 100) * viewportH, rot, op };
}

// One falling icon: a group whose position/rotation is driven every
// frame by sampleFall (replacing the old CSS animation), wrapping a
// SoftBodyMesh (the localized cursor-driven soft-body deformation) whose
// own local geometry stays centered on that group's origin. The cursor
// is projected into this icon's own current local space using the SAME
// rotation-compensation approach the earlier per-icon-canvas version
// used — just sourced from this JS animation state instead of a live
// CSS transform on a DOM element.
function FallingIcon3D({ icon, containerRef }) {
  const { Icon, color, left, duration, delay, size, rotateFrom, rotateTo, drift, opacity } = icon;
  const sourcePx = size * 8;
  const texture = useIconTexture(Icon, color, sourcePx);
  const groupRef = useRef(null);
  const stateRef = useRef({ x: 0, y: 0, rot: 0, op: 0 });

  useFrame((state) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const baseX = (left / 100) * rect.width;
    const raw = (((state.clock.elapsedTime + delay) % duration) + duration) % duration;
    const t = raw / duration;
    const { x, y, rot, op } = sampleFall(t, {
      rotateFrom,
      rotateTo,
      driftX: drift,
      opacity,
      viewportH: window.innerHeight,
    });
    const px = baseX + x;
    stateRef.current = { x: px, y, rot, op };
    if (groupRef.current) {
      groupRef.current.position.set(px, y, 0);
      groupRef.current.rotation.z = (-rot * Math.PI) / 180;
    }
  });

  const getLocalCursor = useMemo(() => {
    return () => {
      const container = containerRef.current;
      if (!container) return { x: -9999, y: -9999, vx: 0, vy: 0 };
      const rect = container.getBoundingClientRect();
      const { x: iconX, y: iconY, rot } = stateRef.current;
      const angle = (-rot * Math.PI) / 180;
      const cos = Math.cos(-angle);
      const sin = Math.sin(-angle);
      const dx = cursorField.x - rect.left - iconX;
      const dy = cursorField.y - rect.top - iconY;
      return {
        x: dx * cos - dy * sin + size / 2,
        y: dx * sin + dy * cos + size / 2,
        vx: cursorField.vx * cos - cursorField.vy * sin,
        vy: cursorField.vx * sin + cursorField.vy * cos,
      };
    };
  }, [containerRef, size]);

  const getOpacity = useMemo(() => () => stateRef.current.op, []);

  return (
    <group ref={groupRef}>
      <group position={[-size / 2, -size / 2, 0]}>
        <SoftBodyMesh
          texture={texture}
          width={size}
          height={size}
          gridCols={GRID}
          gridRows={GRID}
          getLocalCursor={getLocalCursor}
          getOpacity={getOpacity}
          influenceRadius={size * INFLUENCE}
        />
      </group>
    </group>
  );
}

// Ambient background rain of tool icons behind the hero copy — every icon
// is its own independent loop (own size, delay, fall duration, drift and
// rotation), not a single choreographed sequence, so the piece never
// settles into a visible rhythm. Shuffling ICON_SET before assigning
// those values (rather than mapping it in its fixed declaration order)
// is what keeps which icon sits in which delay slot from being the same
// on every load.
//
// All 15 icons share ONE WebGL canvas/context here — giving each its own
// (as an earlier proof of concept briefly did) would mean 15 separate
// WebGLRenderer instances, right at or past most browsers' hard per-page
// context limit (commonly ~16). One shared scene with 15 independently-
// animated meshes avoids that entirely.
export default function FallingIcons() {
  const reduced = usePrefersReducedMotion();
  const containerRef = useRef(null);
  const [sceneSize, setSceneSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    ensureCursorFieldTracking();
    const el = containerRef.current;
    if (!el) return;
    function measure() {
      const rect = el.getBoundingClientRect();
      setSceneSize((prev) => {
        const w = Math.ceil(rect.width);
        const h = Math.ceil(rect.height);
        if (Math.abs(w - prev.w) <= 1 && Math.abs(h - prev.h) <= 1) return prev;
        return { w, h };
      });
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

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
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {sceneSize.w > 0 && sceneSize.h > 0 && (
        <Canvas
          orthographic
          linear
          camera={{
            left: 0,
            right: sceneSize.w,
            top: 0,
            bottom: sceneSize.h,
            near: 0.1,
            far: 1000,
            position: [0, 0, 100],
          }}
          gl={{ alpha: true, antialias: true }}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <CameraSync width={sceneSize.w} height={sceneSize.h} />
          {icons.map((icon) => (
            <FallingIcon3D key={icon.id} icon={icon} containerRef={containerRef} />
          ))}
        </Canvas>
      )}
    </div>
  );
}
