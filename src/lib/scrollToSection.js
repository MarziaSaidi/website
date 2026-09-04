// The site's router treats any "#/..." hash as a page route (see
// useHashRoute.js) — a plain in-page "#overview" anchor would be read as an
// unknown route and bounce back to Home. So in-page section links never
// touch window.location.hash directly: they scroll manually and record the
// section in the URL via replaceState, which never fires "hashchange" and
// therefore never reaches the router.
export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  const base = window.location.hash.split("#")[1] || "";
  window.history.replaceState(null, "", `#${base}#${id}`);
}

// On direct load of a URL like "#/qalin#key-decisions", jump to the
// sub-section once the page has painted.
export function scrollToHashedSectionOnLoad() {
  const parts = window.location.hash.split("#");
  const id = parts[2];
  if (!id) return;
  requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
  });
}
