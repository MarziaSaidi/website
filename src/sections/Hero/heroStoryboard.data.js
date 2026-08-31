// Shared between Hero.jsx (the "Scroll to see how I work" prompt scrolls
// here) and ProcessSection.jsx (the section that owns this id) — a plain
// string constant rather than each file hardcoding "process" separately.
export const PROCESS_SECTION_ID = "process";

// Stage windows the storyboard's scroll progress (0 -> 1) is mapped onto —
// the same five windows the standalone scroll prototype validated (each
// stage's own art fades in region-by-region across most of its window,
// holds complete, then hands off to the next).
export const STAGES = [
  {
    key: "discover",
    number: "01",
    label: "Discover",
    from: 0,
    to: 0.2,
    description:
      "It starts with a question, not a screen. Sticky notes, half formed flows, a user need I can't quite draw yet.",
    tags: ["User need", "Why?", "Pain point"],
  },
  {
    key: "design",
    number: "02",
    label: "Design",
    from: 0.2,
    to: 0.4,
    description: "The mess starts organizing itself. Boxes align, flows straighten, and a real hierarchy starts to hold.",
    tags: ["Flow", "Hierarchy", "Component"],
  },
  {
    key: "build",
    number: "03",
    label: "Build",
    from: 0.4,
    to: 0.65,
    description: "Wireframes become real interface (typography, buttons, states, code) assembled in front of you.",
    tags: ["Component", "Type", "Code"],
  },
  {
    key: "refine",
    number: "04",
    label: "Refine",
    from: 0.65,
    to: 0.85,
    description:
      "This is where it starts to feel alive: spacing, timing, alignment. Details most people never notice, until they're wrong.",
    tags: ["Align", "Timing", "Details matter"],
  },
  {
    key: "ship",
    number: "05",
    label: "Ship",
    from: 0.85,
    to: 1,
    description: "Designed, built, and shipped by the same hands. The sketch is gone; the product is real.",
    tags: ["Designed", "Built", "Shipped"],
  },
];
