// Shared pointer tracker (viewport position + instantaneous velocity in
// px/ms) for every localized cursor-driven soft-body deformation on the
// page — one `pointermove` listener regardless of how many deforming
// elements exist, rather than each one attaching its own. Velocity is
// deliberately raw here (not smoothed) — each consumer applies its own
// falloff/spring per node, so a second layer of smoothing upstream would
// just double-damp the response.
export const cursorField = { x: -9999, y: -9999, vx: 0, vy: 0 };

let lastX = null;
let lastY = null;
let lastT = 0;
let attached = false;

export function ensureCursorFieldTracking() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  window.addEventListener(
    "pointermove",
    (e) => {
      const t = e.timeStamp;
      if (lastX !== null) {
        const dt = Math.max(1, t - lastT);
        cursorField.vx = (e.clientX - lastX) / dt;
        cursorField.vy = (e.clientY - lastY) / dt;
      }
      cursorField.x = e.clientX;
      cursorField.y = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = t;
    },
    { passive: true }
  );
}
