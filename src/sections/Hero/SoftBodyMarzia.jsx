import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { cursorField, ensureCursorFieldTracking } from "../../hooks/useCursorField";
import SoftBodyMesh from "./SoftBodyMesh";

// R3F's `camera` prop on <Canvas> only reliably configures the camera
// ONCE, at creation — passing a new {left, right, top, bottom} object on
// every render (as we do here, since size.w/h changes on resize and
// MARZIA's font-size is viewport-height-dependent) isn't guaranteed to
// update an already-constructed orthographic camera's frustum. Left
// stale, the frustum stops matching the actual canvas size — which
// reads as "not responsive" and, when the canvas ends up smaller than
// the stale frustum still assumes, as MARZIA being cropped. Explicitly
// syncing left/right/top/bottom (and calling updateProjectionMatrix)
// whenever width/height actually change is the reliable fix.
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

// Tall and narrow (MARZIA's own box is roughly 1:4.46, width:height), so
// more rows than columns keeps individual cells close to square.
const GRID_COLS = 10;
const GRID_ROWS = 40;
const INFLUENCE_WIDTHS = 3; // cursor influence radius, in multiples of MARZIA's own current width
// .hero-marzia-mark has no rotation transform — the vertical-rl
// writing-mode with sideways text-orientation already positions it correctly.
const ANGLE = 0;

// An SVG rendered via <img src="data:image/svg+xml..."> runs in the
// browser's restricted "image" mode, which can't fetch external
// resources — including @font-face files the PAGE itself already
// loaded, even same-origin ones like Google Fonts. That's not a timing
// issue (document.fonts.ready doesn't fix it, it's not about whether
// the font loaded yet) — it's an access restriction on the image
// context itself. The only reliable fix is embedding the actual font
// file, base64-encoded, directly inside the SVG's own <style> — fetched
// once and cached here, since it's the same Orbitron 800 file on every
// MARZIA (re)rasterization.
let orbitronFontFacePromise = null;
function getOrbitronFontFace() {
  if (!orbitronFontFacePromise) {
    orbitronFontFacePromise = fetch("https://fonts.googleapis.com/css2?family=Orbitron:wght@800&display=swap")
      .then((r) => r.text())
      .then((css) => {
        const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\) format\('woff2'\)/);
        if (!match) return "";
        return fetch(match[1])
          .then((r) => r.blob())
          .then(
            (blob) =>
              new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
              })
          )
          .then(
            (dataUrl) =>
              `@font-face { font-family: 'OrbitronEmbedded'; src: url(${dataUrl}) format('woff2'); font-weight: 800; font-style: normal; }`
          );
      })
      .catch(() => ""); // falls back to the div's default sans-serif rather than failing the whole rasterize
  }
  return orbitronFontFacePromise;
}

// Rasterizes the hidden reference span (see markRef in Hero.jsx) into a
// THREE.CanvasTexture. Uses a native SVG <text> with writing-mode +
// text-orientation attributes, NOT <foreignObject> + HTML — SVG text
// with an embedded @font-face is a mature, extremely well-supported
// combination (it's how chart/diagram libraries have embedded custom
// fonts for years); foreignObject-with-HTML-and-CSS-writing-mode is a
// much newer, less consistently-supported combination, and switching
// away from it removes a whole layer of uncertainty about why the
// embedded font wasn't actually rendering.
//
// Plain "MARZIA" (not reversed) with writing-mode: vertical-rl and
// text-orientation: sideways renders bottom-to-top: M at top, A at bottom
// (reads correctly when tilting head to the right).
function useMarziaTexture(markRef, w, h) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    const mark = markRef.current;
    if (!mark || w < 1 || h < 1) return;
    let cancelled = false;
    const scale = 4;

    async function rasterize() {
      const fontFace = await getOrbitronFontFace();
      if (cancelled) return;
      const cs = getComputedStyle(mark);
      const cx = w / 2;
      const cy = h / 2;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * scale}" height="${h * scale}"><defs><style>${fontFace}</style></defs><g transform="scale(${scale})"><text x="${cx}" y="${cy}" font-family="'OrbitronEmbedded', ${cs.fontFamily}" font-weight="${cs.fontWeight}" font-size="${cs.fontSize}" fill="${cs.color}" writing-mode="vertical-lr" text-orientation="sideways" text-anchor="middle" dominant-baseline="central">MARZIA</text></g></svg>`;
      const img = new window.Image();
      img.onload = () => {
        if (cancelled) return;
        const canvas = document.createElement("canvas");
        canvas.width = w * scale;
        canvas.height = h * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        // No colorSpace tag here on purpose — see the <Canvas linear>
        // comment below for why: a custom ShaderMaterial doesn't get
        // Three.js's automatic sRGB texture decode, so tagging the
        // texture sRGB while the renderer ALSO re-encodes its output
        // double-applies the gamma curve and visibly shifts the hue
        // (this exact bug is why MARZIA was reading blue instead of
        // lavender). Leaving both untagged keeps it a straight pass-
        // through: the canvas's own pixel bytes reach the screen as-is.
        const tex = new THREE.CanvasTexture(canvas);
        setTexture(tex);
      };
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    rasterize();

    return () => {
      cancelled = true;
    };
  }, [markRef, w, h]);
  return texture;
}

// Same localized cursor-driven soft-body deformation as the falling
// icons (see SoftBodyMesh.jsx, shared by both)
// (identical mesh/physics/shader — see SoftBodyMesh.jsx), applied to
// MARZIA instead of a falling icon.
export default function SoftBodyMarzia({ markRef }) {
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    ensureCursorFieldTracking();
    const mark = markRef.current;
    if (!mark) return;
    function measure() {
      const rect = mark.getBoundingClientRect();
      setSize((prev) => {
        const w = Math.ceil(rect.width);
        const h = Math.ceil(rect.height);
        if (Math.abs(w - prev.w) <= 1 && Math.abs(h - prev.h) <= 1) return prev;
        return { w, h };
      });
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(mark);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [markRef]);

  const texture = useMarziaTexture(markRef, size.w, size.h);

  const getLocalCursor = useMemo(() => {
    return () => {
      const mark = markRef.current;
      if (!mark) return { x: -9999, y: -9999, vx: 0, vy: 0 };
      const rect = mark.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const cos = Math.cos(-ANGLE);
      const sin = Math.sin(-ANGLE);
      const dx = cursorField.x - cx;
      const dy = cursorField.y - cy;
      return {
        x: dx * cos - dy * sin + size.w / 2,
        y: dx * sin + dy * cos + size.h / 2,
        vx: cursorField.vx * cos - cursorField.vy * sin,
        vy: cursorField.vx * sin + cursorField.vy * cos,
      };
    };
  }, [markRef, size.w, size.h]);

  if (size.w < 1 || size.h < 1) return null;

  return (
    <div ref={wrapRef} className="hero-marzia-mark" aria-hidden="true" style={{ width: size.w, height: size.h }}>
      <Canvas
        orthographic
        linear
        camera={{ left: 0, right: size.w, top: 0, bottom: size.h, near: 0.1, far: 1000, position: [0, 0, 100] }}
        gl={{ alpha: true, antialias: true }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <CameraSync width={size.w} height={size.h} />
        <SoftBodyMesh
          texture={texture}
          width={size.w}
          height={size.h}
          gridCols={GRID_COLS}
          gridRows={GRID_ROWS}
          getLocalCursor={getLocalCursor}
          influenceRadius={size.w * INFLUENCE_WIDTHS}
          maxOffsetFactor={0.4}
        />
      </Canvas>
    </div>
  );
}
