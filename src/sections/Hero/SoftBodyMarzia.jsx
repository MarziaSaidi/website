import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { cursorField, ensureCursorFieldTracking } from "../../hooks/useCursorField";
import SoftBodyMesh from "./SoftBodyMesh";

// Tall and narrow (MARZIA's own box is roughly 1:4.46, width:height), so
// more rows than columns keeps individual cells close to square.
const GRID_COLS = 10;
const GRID_ROWS = 40;
const INFLUENCE_WIDTHS = 3; // cursor influence radius, in multiples of MARZIA's own current width
// .hero-marzia-mark's own transform is a fixed rotate(180deg) — never
// animates — so unlike the falling icons this is a constant, not
// something read off getComputedStyle every frame.
const ANGLE = Math.PI;

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
// THREE.CanvasTexture, via the same SVG <foreignObject> technique as the
// earlier Canvas2D version — the browser's own CSS engine does MARZIA's
// vertical-writing-mode layout, exactly as it does for the original.
// `transform` is deliberately excluded from what's copied; the mesh's
// own DOM wrapper carries the same .hero-marzia-mark class (and so the
// same fixed rotate(180deg)) as the original, so the rotation is applied
// once by CSS on the wrapper, not baked into the texture too.
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
      const innerStyle = [
        `font-family:'OrbitronEmbedded',${cs.fontFamily}`,
        `font-weight:${cs.fontWeight}`,
        `font-size:${cs.fontSize}`,
        `line-height:${cs.lineHeight}`,
        `color:${cs.color}`,
        `writing-mode:${cs.writingMode}`,
        `text-orientation:${cs.textOrientation}`,
        `white-space:${cs.whiteSpace}`,
      ].join(";");
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * scale}" height="${h * scale}"><defs><style>${fontFace}</style></defs><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px;transform:scale(${scale});transform-origin:top left;display:flex;align-items:center;justify-content:center;"><span style="${innerStyle}">MARZIA</span></div></foreignObject></svg>`;
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
        <SoftBodyMesh
          texture={texture}
          width={size.w}
          height={size.h}
          gridCols={GRID_COLS}
          gridRows={GRID_ROWS}
          getLocalCursor={getLocalCursor}
          influenceRadius={size.w * INFLUENCE_WIDTHS}
          maxOffsetFactor={0.4}
          extrudeDepth={Math.max(6, size.w * 0.09)}
          sideColor="#241f4d"
        />
      </Canvas>
    </div>
  );
}
