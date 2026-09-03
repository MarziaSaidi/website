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

    function rasterize() {
      const cs = getComputedStyle(mark);
      const innerStyle = [
        `font-family:${cs.fontFamily}`,
        `font-weight:${cs.fontWeight}`,
        `font-size:${cs.fontSize}`,
        `line-height:${cs.lineHeight}`,
        `color:${cs.color}`,
        `writing-mode:${cs.writingMode}`,
        `text-orientation:${cs.textOrientation}`,
        `white-space:${cs.whiteSpace}`,
      ].join(";");
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * scale}" height="${h * scale}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px;transform:scale(${scale});transform-origin:top left;display:flex;align-items:center;justify-content:center;"><span style="${innerStyle}">MARZIA</span></div></foreignObject></svg>`;
      const img = new window.Image();
      img.onload = () => {
        if (cancelled) return;
        const canvas = document.createElement("canvas");
        canvas.width = w * scale;
        canvas.height = h * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      };
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }

    rasterize();
    document.fonts?.ready.then(() => {
      if (!cancelled) rasterize();
    });

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
        />
      </Canvas>
    </div>
  );
}
