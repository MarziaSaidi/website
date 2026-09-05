import { useEffect, useRef } from "react";

// Canvas fillStyle needs a literal color string (Canvas2D can't consume a
// CSS var), so glyph colors are read live from the current theme (same
// technique the old dust effect used) — light and dark need different
// values to read clearly against the footer's background either way.
// Full-contrast --color-text (not the muted --color-text-secondary) so the
// word actually reads instead of sitting at decorative-texture contrast.
const GLYPH_LIGHT = "21, 20, 17"; // light --color-text (#151411)
const GLYPH_DARK = "241, 240, 255"; // dark --color-text (#F1F0FF)
const GLYPH_ACTIVE_LIGHT = "88, 73, 188"; // light --color-accent (#5849BC)
const GLYPH_ACTIVE_DARK = "217, 139, 255"; // dark --color-accent-secondary (#D98BFF)

function currentGlyphColors() {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  return {
    rest: dark ? GLYPH_DARK : GLYPH_LIGHT,
    active: dark ? GLYPH_ACTIVE_DARK : GLYPH_ACTIVE_LIGHT,
  };
}

// A light-weight curated set, not the full keyboard — heavy glyphs
// (@ # $ % & most capital letters) carry enough of their own ink that at
// high grid density they compete with the word's own silhouette instead
// of just texturing it. These are thin strokes and light punctuation, so
// each lit cell reads as texture rather than a second, smaller letter
// fighting the real one.
const GLYPHS = ".:'`-_~+=*/\\|<>^1lI".split("");
function randGlyph() {
  return GLYPHS[(Math.random() * GLYPHS.length) | 0];
}
// Slow and staggered: only a handful of cells are ever mid-swap at once,
// so the word stays readable at rest instead of reading as static. The
// earlier 20-90 frame range (~0.3-1.5s per cell) had so much of the grid
// changing at any instant that the letterforms never held still long
// enough to parse.
function randGlyphInterval() {
  return 150 + Math.random() * 300; // frames between one cell's own glyph swaps (~2.5-7.5s)
}

// One row — "DESIGN ENGINEER" stays a single line, both words on the same
// baseline. Height is derived from the font size that fills the width
// (not a fixed h-40/h-56), so the button is sized to exactly what the
// glyphs need.
const TEXT = "DESIGN ENGINEER";
// The mask was sampled at weight 700 (bold) — a bold stroke is thick
// enough that it lands on ~4 rows of cells even at a resolution where a
// diagonal or curve should taper down to one. Weight 400 (regular, also
// loaded — see index.html) has a real, thinner stroke, so it samples
// down to ~1-2 rows on straight edges and naturally tapers thinner
// through curves/diagonals, the same way any regular-weight glyph does —
// nothing to hand-code, just sampling the actual thinner outline.
const MASK_WEIGHT = 400;
// These two work against each other by construction: cell size solves to
// (width * WIDTH_FILL) / trackedWidth(TEXT), so tighter tracking shrinks
// trackedWidth, which grows cell — and cell is what sets the font size
// letters are actually drawn at (draw() sizes its font off it directly).
// Less space between characters and a taller word are the same knob.
const TRACKING_EM = 0.1; // gap between characters, as a fraction of font size
const WIDTH_FILL = 0.97; // the line fills this fraction of the available width
// The actual letter height, in real px — independent of the width-fit
// `cell` above. build() works out whatever Y-only stretch factor makes
// the glyphs' natural (unstretched) height come out to exactly this many
// px at the current `cell`, then applies that stretch as a canvas
// transform that only ever multiplies y — every x-position (driven by
// trackedWidth/measureText) passes through untouched. Width and height
// are two independent inputs here, not two outputs of one solve.
const TARGET_LETTER_HEIGHT = 160; // was 350 — the block itself read as oversized
const VERTICAL_PADDING = 1.6; // room above/below the (stretched) glyphs, as a multiple of line height
// The mask-resolution lever. cols/rows scale linearly with it while
// `cell` (and so the size of each individually-DISPLAYED character,
// drawn at cell*0.86 in draw()) scales as 1/DENSITY — raising it trades
// bigger displayed characters for a cleaner mask. 24 gave ~17 cells per
// letter (very clean silhouette) but shrank displayed characters to
// ~4.3px, illegible as individual glyphs. 16 still renders "DESIGN
// ENGINEER" cleanly (verified) at ~11 cells per letter, with displayed
// characters closer to ~6.5px — the balance point between the two
// complaints (word too coarse vs. characters too small).
const DENSITY = 16;
const HOVER_RADIUS = 3.4; // cells
const HOVER_PUSH = 2.6; // cells
const GRAVITY = 0.075; // cells / frame^2 — a real drop, not a slow-motion one
const BOUNCE = 0.36; // settles in 2-3 small bounces instead of lingering
const EASE = 0.16;
const RETURN_EASE = 0.13; // rising back into place reads snappier than a generic ease

export default function FooterSignature() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let cell = 13; // px per grid cell — recomputed by build(), not fixed
    let cells = [];
    // logo (resting/hover) -> scattered -> fallen -> returning -> logo
    let phase = "logo";
    let cursor = { gx: -999, gy: -999 };
    let raf = 0;
    let timers = [];

    // One offscreen context reused for every measurement and for the
    // sampling canvas — canvas glyph metrics scale linearly with font
    // size for a fixed family/weight, which is what makes the solve
    // below exact rather than an iterative shrink-and-recheck guess.
    const probe = document.createElement("canvas").getContext("2d");

    function trackedWidth(text, fontSize) {
      probe.font = `${MASK_WEIGHT} ${fontSize}px "Space Grotesk", sans-serif`;
      let total = 0;
      for (const ch of text) total += probe.measureText(ch).width;
      total += TRACKING_EM * fontSize * (text.length - 1);
      return total;
    }

    // Reads the word off a hidden, tiny (one-pixel-per-cell) offscreen
    // canvas — the same trick the reference effect uses to turn a logo
    // image into a grid, just sampling rendered text instead of a bitmap.
    //
    // The shape is solved, not guessed: at a fixed sampling font size
    // (DENSITY, in cell units) the tracked line is some number of cells
    // wide. Cell size is exactly whatever makes that width fill
    // WIDTH_FILL of the real container width — one division, not a
    // shrink-and-recheck loop. Line height then comes straight from the
    // font's own ascent/descent at that same DENSITY, so the button's
    // own height is derived from the glyphs actually being drawn instead
    // of the text being shrunk to fit a fixed, guessed-at h-40/h-56.
    function build() {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      if (width < 10) {
        cells = [];
        return;
      }

      const lineCells = trackedWidth(TEXT, DENSITY);
      cell = (width * WIDTH_FILL) / lineCells;
      cols = Math.max(4, Math.round(width / cell));

      probe.font = `${MASK_WEIGHT} ${DENSITY}px "Space Grotesk", sans-serif`;
      const metrics = probe.measureText(TEXT);
      const ascent = metrics.actualBoundingBoxAscent ?? DENSITY * 0.73;
      const descent = metrics.actualBoundingBoxDescent ?? 0;
      const naturalLineHeightCells = ascent + descent;
      const naturalLetterHeightPx = naturalLineHeightCells * cell;
      const stretch = TARGET_LETTER_HEIGHT / naturalLetterHeightPx;
      const lineHeightCells = naturalLineHeightCells * stretch;
      rows = Math.max(6, Math.ceil(lineHeightCells * VERTICAL_PADDING));

      height = rows * cell;
      wrap.style.height = `${height}px`;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const octx = off.getContext("2d");
      octx.fillStyle = "#fff";
      octx.textAlign = "left";
      octx.textBaseline = "alphabetic";
      octx.font = `${MASK_WEIGHT} ${DENSITY}px "Space Grotesk", sans-serif`;

      // A Y-only scale draws the glyphs `stretch` taller without touching
      // a single x-coordinate — fillText's x positions (and the
      // trackedWidth/measureText calls that place them) are computed in
      // this same unscaled space and pass straight through a scale(1, s)
      // transform unaffected, since that only multiplies y. The baseline
      // is solved backwards through the transform (divide by stretch) so
      // the final, stretched result still centers on centerRowCells:
      // stretched final y = stretch * baseline [scale from origin], and
      // we want that to equal centerRowCells - lineHeightCells/2 +
      // ascent*stretch (the normal centering formula, in already-
      // stretched units).
      const centerRowCells = rows / 2;
      const baseline = (centerRowCells - lineHeightCells / 2) / stretch + ascent;
      octx.scale(1, stretch);
      const gap = TRACKING_EM * DENSITY;
      let x = (cols - lineCells) / 2;
      for (const ch of TEXT) {
        octx.fillText(ch, x, baseline);
        x += probe.measureText(ch).width + gap;
      }

      const data = octx.getImageData(0, 0, cols, rows).data;
      const next = [];
      for (let ry = 0; ry < rows; ry++) {
        for (let rx = 0; rx < cols; rx++) {
          const idx = (ry * cols + rx) * 4;
          if (data[idx + 3] / 255 > 0.4) {
            next.push({
              col: rx,
              row: ry,
              glyph: randGlyph(),
              glyphTimer: Math.random() * 450,
              ox: 0,
              oy: 0,
              scatterX: 0,
              scatterY: 0,
              floorX: 0,
              fallSpeed: 0,
              weight: 0,
            });
          }
        }
      }
      cells = next;
    }

    // Picks a fresh landing spot for every cell, spread across the WHOLE
    // band — but stratified, not purely random. Plain `Math.random()` per
    // cell is the classic cause of a "messy" scatter: with only a few
    // dozen points, uniform random sampling reliably clumps some areas
    // and leaves others empty (it has no memory of where earlier points
    // landed). Dividing the band into a jittered grid — one slot per
    // character, shuffled, with a small random offset inside each slot —
    // guarantees even coverage while still looking organic rather than
    // gridded.
    function randomizeScatter() {
      const n = cells.length;
      if (n === 0) return;

      const aspect = cols / rows;
      const gridCols = Math.max(1, Math.round(Math.sqrt(n * aspect)));
      const gridRows = Math.max(1, Math.ceil(n / gridCols));

      const slots = [];
      for (let gy = 0; gy < gridRows; gy++) {
        for (let gx = 0; gx < gridCols; gx++) slots.push(gx + gridCols * gy);
      }
      for (let i = slots.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [slots[i], slots[j]] = [slots[j], slots[i]];
      }

      const slotW = cols / gridCols;
      const slotH = rows / gridRows;
      cells.forEach((c, i) => {
        const slot = slots[i % slots.length];
        const sx = slot % gridCols;
        const sy = Math.floor(slot / gridCols);
        const targetX = (sx + 0.2 + Math.random() * 0.6) * slotW;
        const targetY = (sy + 0.2 + Math.random() * 0.6) * slotH;
        c.scatterX = targetX - c.col;
        c.scatterY = targetY - c.row;
      });
    }

    // Landed characters must spread evenly across the WHOLE floor width,
    // not straight down from wherever they started — falling straight
    // down lands each character directly under its own letter, so the
    // gaps between letters and words (real negative space in the word)
    // carry straight through to the floor as gaps in the landed pattern,
    // reading as a dashed line instead of a solid one. Stratified slots
    // (same even-coverage idea as randomizeScatter, just 1D) fix that:
    // every character gets its own slot spanning the full floor, so by
    // the time they land they've filled in those gaps.
    function assignFloorLine() {
      const n = cells.length;
      if (n === 0) return;
      const slots = Array.from({ length: n }, (_, i) => i);
      for (let i = slots.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [slots[i], slots[j]] = [slots[j], slots[i]];
      }
      const slotW = cols / n;
      cells.forEach((c, i) => {
        const targetCol = (slots[i] + 0.1 + Math.random() * 0.8) * slotW;
        c.floorX = targetCol - c.col;
      });
    }

    function pointToGrid(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      cursor.gx = (clientX - rect.left) / cell;
      cursor.gy = (clientY - rect.top) / cell;
    }

    function easeToward(c, tx, ty, amt) {
      c.ox += (tx - c.ox) * amt;
      c.oy += (ty - c.oy) * amt;
    }

    function update() {
      let everyoneHome = phase === "returning";
      for (const c of cells) {
        c.glyphTimer -= 1;
        if (c.glyphTimer <= 0) {
          c.glyph = randGlyph();
          c.glyphTimer = randGlyphInterval();
        }

        if (c.weight > 0) {
          c.weight -= 1;
          continue;
        }
        if (phase === "scattered") {
          easeToward(c, c.scatterX, c.scatterY, 0.08);
        } else if (phase === "fallen") {
          const floor = rows - 1 - c.row;
          c.fallSpeed += GRAVITY;
          c.oy += c.fallSpeed;
          if (c.oy > floor) {
            c.oy = floor;
            c.fallSpeed *= -BOUNCE;
          }
          c.ox += (c.floorX - c.ox) * 0.05;
        } else if (phase === "returning") {
          easeToward(c, 0, 0, RETURN_EASE);
          if (Math.hypot(c.ox, c.oy) > 0.03) everyoneHome = false;
        } else {
          const dx = c.col - cursor.gx;
          const dy = c.row - cursor.gy;
          const dist = Math.hypot(dx, dy);
          if (dist < HOVER_RADIUS) {
            const push = (1 - dist / HOVER_RADIUS) * HOVER_PUSH;
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);
            easeToward(c, nx * push, ny * push, EASE);
          } else {
            easeToward(c, 0, 0, EASE);
          }
        }
      }
      if (phase === "returning" && everyoneHome) phase = "logo";
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.font = `600 ${cell * 0.86}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const { rest, active } = currentGlyphColors();
      for (const c of cells) {
        const isNear = phase === "logo" && Math.hypot(c.col - cursor.gx, c.row - cursor.gy) < HOVER_RADIUS;
        ctx.fillStyle = `rgb(${isNear ? active : rest})`;
        const x = (c.col + c.ox + 0.5) * cell;
        const y = (c.row + c.oy + 0.5) * cell;
        ctx.fillText(c.glyph, x, y);
      }
    }

    function loop() {
      update();
      draw();
      raf = requestAnimationFrame(loop);
    }

    function onMove(e) {
      pointToGrid(e.clientX, e.clientY);
    }
    function onLeave() {
      cursor.gx = -999;
      cursor.gy = -999;
    }

    function goScattered() {
      if (cells.length === 0) return;
      randomizeScatter();
      phase = "scattered";
      cells.forEach((c) => { c.weight = Math.random() * 18; });
    }
    function goFallen() {
      if (cells.length === 0) return;
      assignFloorLine();
      phase = "fallen";
      cells.forEach((c) => {
        c.fallSpeed = 0;
        c.weight = Math.random() * 10;
      });
    }
    function goReturning() {
      if (cells.length === 0) return;
      phase = "returning";
      cells.forEach((c) => { c.weight = Math.random() * 18; });
    }

    // One step per click/keyboard-activation: logo -> scattered -> fallen
    // -> returning (which flips itself back to logo once every character
    // has eased home — see update() above).
    function onActivate() {
      if (cells.length === 0) return;
      if (phase === "logo") goScattered();
      else if (phase === "scattered") goFallen();
      else if (phase === "fallen") goReturning();
    }

    // Falls on its own from its resting shape, then rises back into
    // place — no click needed. Runs every time the scroll position
    // carries the band's middle into view, not once ever: goFallen()
    // guards on phase === "logo" so it only starts from rest, and
    // update() flips fallen -> returning's eventual settle back to
    // "logo" on its own, which is what lets this fire again next time.
    // How long the fall genuinely takes to settle, derived from the same
    // physics update() actually runs — not a guessed constant. The
    // topmost row falls farthest (floor = rows-1), and each bounce after
    // impact adds a full up-down cycle at BOUNCE× the previous speed; the
    // geometric sum of that decaying series is (1+BOUNCE)/(1-BOUNCE)
    // times the initial fall time. A hardcoded delay drifts out of sync
    // the moment rows/GRAVITY/BOUNCE change (as they just did) and cuts
    // the bounce off mid-cycle — which reads as a glitch, not a fall.
    function fallSettleMs() {
      const fallFrames = Math.sqrt((2 * (rows - 1)) / GRAVITY);
      const settleFrames = fallFrames * ((1 + BOUNCE) / (1 - BOUNCE));
      const staggerMaxFrames = 10; // matches goFallen's per-cell weight range
      return ((staggerMaxFrames + settleFrames) / 60) * 1000;
    }

    function playEntrance() {
      if (cells.length === 0 || phase !== "logo") return;
      goFallen();
      timers.push(setTimeout(goReturning, fallSettleMs()));
    }

    build();
    const ro = new ResizeObserver(build);
    ro.observe(wrap);

    // Listeners live on `wrap` (the button), not the canvas, so a
    // keyboard Enter/Space — which dispatches its click with the button
    // itself as the target — reaches onActivate too, not just a real
    // pointer click on the canvas.
    if (!reduce) {
      wrap.addEventListener("mousemove", onMove);
      wrap.addEventListener("mouseleave", onLeave);
    }
    wrap.addEventListener("click", onActivate);

    // Reduced motion: skip the fall/rise entrance entirely — the word
    // just sits resting and legible, no scroll-triggered motion.
    //
    // No disconnect() — this stays live so it fires every time the band's
    // middle crosses into view, not once ever. playEntrance() itself
    // guards on phase === "logo", so a re-trigger mid-cycle (scrolling
    // past it while it's already falling) is just ignored rather than
    // restarting it.
    let io = null;
    if (!reduce) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) playEntrance();
          });
        },
        { threshold: 0.5 }
      );
      io.observe(wrap);
    }

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (io) io.disconnect();
      timers.forEach(clearTimeout);
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
      wrap.removeEventListener("click", onActivate);
    };
  }, []);

  return (
    <>
      {/* Below the width the grid has room to read as text, show the
          words plainly instead — same fallback the reference effect
          uses for its logo image. */}
      <p className="sm:hidden text-center text-sm text-text-secondary">Design Engineer</p>
      {/* No fixed height: build() computes it from the font size that
          fills the width, then sets it via style.height directly — the
          min-h below is only what shows for the one frame before that
          first measurement lands. */}
      <button
        ref={wrapRef}
        type="button"
        aria-label="Design Engineer — click to scatter and reassemble"
        data-cursor-exempt
        className="hidden sm:block relative w-full min-h-[220px] md:min-h-[300px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-md"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      </button>
    </>
  );
}
