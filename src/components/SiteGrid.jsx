// Decorative column/row grid — a stationary technical overlay in front
// of the whole site (see .site-grid in index.css for the line math and
// why it never moves: no scroll-linked offset, position: fixed, so the
// page scrolls underneath it rather than the grid scrolling with the
// page). Mounted once by App so every route gets it without each page
// having to own it.
export default function SiteGrid() {
  return <div className="site-grid" aria-hidden="true" />;
}
