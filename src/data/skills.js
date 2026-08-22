// Grouped by design → interaction → implementation → product, not by
// alphabet or tool category — the grouping itself is meant to read as "how
// these disciplines relate," shown in About's skill explorer.
export const skillGroups = [
  {
    id: "build",
    label: "Build",
    skills: [
      {
        name: "React",
        note: "I use React to turn interaction ideas into real interfaces — component systems, hooks for state, and performance considered from the start.",
      },
      {
        name: "TypeScript",
        note: "I write TypeScript so types double as documentation, catching mistakes early without getting in the way of shipping.",
      },
      {
        name: "CSS",
        note: "I write CSS by hand for layout, motion, and responsive behavior — no framework standing between me and the interaction I want.",
      },
      {
        name: "APIs & auth",
        note: "I connect interfaces to real data: REST APIs, OAuth flows, and role-based access handled as part of the design, not bolted on after.",
      },
    ],
  },
  {
    id: "design",
    label: "Design",
    skills: [
      {
        name: "Figma",
        note: "I prototype in Figma until it's real enough to hand straight to engineering — no gap between what's designed and what ships.",
      },
      {
        name: "Design systems",
        note: "I build design systems where tokens and components are one source of truth, so design and code never drift apart.",
      },
      {
        name: "Motion design",
        note: "I use motion to explain relationships and state changes — never decoration for its own sake.",
      },
      {
        name: "Prototyping",
        note: "I move from wireframe to working code fast, so decisions get tested against something real, not just a mockup.",
      },
    ],
  },
  {
    id: "product",
    label: "Product",
    skills: [
      {
        name: "Accessibility",
        note: "I design for contrast, full keyboard paths, and reduced motion from the start — accessibility as a default, not a pass at the end.",
      },
      {
        name: "User research",
        note: "I ground decisions in real users: journey maps and usability reviews, not assumptions.",
      },
    ],
  },
];
