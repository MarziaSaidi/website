// Work is organized around what each project demonstrates — Design + Build,
// Design, or Engineering — not around resume job titles. `tier` sets visual
// weight (1 = flagship, 2 = important, 3 = supporting); it's constant across
// filters so a project's presentation never jumps in size as the filter
// changes, only its position does.

export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "design-build", label: "Design + Build" },
  { id: "design", label: "Design" },
  { id: "engineering", label: "Engineering" },
];

export const DEFAULT_CATEGORY = "design-build";

export const work = [
  {
    id: "supportiq",
    name: "SupportIQ",
    tier: 1,
    world: "gold",
    category: "design-build",
    labels: ["Design + Build", "AI", "Full-Stack"],
    description:
      "An AI-powered, multi-tenant customer support platform — designed and built from product concept through full-stack implementation, with a RAG pipeline, JWT auth, and role-based access.",
    preview: "chat",
    live: "https://supportiq-theta.vercel.app/",
    liveLabel: "Live project",
  },
  {
    id: "survue",
    name: "Survue",
    tier: 1,
    world: "green",
    category: "design-build",
    labels: ["Design + Build", "Mobile", "UX"],
    description:
      "Cyclist-safety alerts a rider can trust at a glance — UX led from journey maps through prototypes, then the settings module built and shipped to 100+ early users across iOS, Android, and Windows.",
    preview: "device",
    previewSrc: "/survue/ride-monitoring.png",
    previewWidth: 628,
    previewHeight: 1278,
    previewAlt: "Survue's live ride-monitoring alert screen",
    href: "#/survue",
    hrefLabel: "Case study",
  },
  {
    id: "get-campus",
    name: "Get Campus",
    tier: 2,
    world: "gold",
    category: "design",
    labels: ["Design", "Product", "Web"],
    description:
      "An employer platform designed end to end in Figma and shipped as production-ready specs — onboarding, job posting, applications, and billing, working directly with founders and engineers.",
    preview: "browser",
    previewSrc: "/get-campus/dashboard-overview.png",
    previewWidth: 2880,
    previewHeight: 1800,
    previewAlt: "Get Campus's employer dashboard overview",
    previewUrl: "getcampus.app/dashboard",
    href: "#/get-campus",
    hrefLabel: "Case study",
  },
  {
    id: "relay",
    name: "Relay",
    tier: 2,
    world: "green",
    category: "design",
    labels: ["Design", "Product", "Figma"],
    description:
      "A real-time console for running a live delivery fleet — the information hierarchy for a high-density dispatch surface, designed in Figma as a live, interactive prototype.",
    preview: "browser",
    previewSrc: "/relay/dispatch-overview.png",
    previewWidth: 2880,
    previewHeight: 1800,
    previewAlt: "Relay's live dispatch overview console",
    previewUrl: "relay.app/dispatch",
    href: "#/relay",
    hrefLabel: "Case study",
    live: "https://author-sync-40384662.figma.site/",
    liveLabel: "Live prototype",
  },
  {
    id: "quill-pigeon",
    name: "Quill & Pigeon",
    tier: 3,
    world: "gold",
    category: "engineering",
    labels: ["Engineering", "Full-Stack"],
    description:
      "An automated CSV/XLSX import pipeline with validation and address correction, plus an OAuth-synced reminder system — production software built for a 100+ person internal team.",
    preview: "validator",
  },
  {
    id: "wildwood",
    name: "Wildwood Oyster Co.",
    tier: 3,
    world: "green",
    category: "engineering",
    labels: ["Engineering", "Frontend"],
    description:
      "Responsive pages and custom Shopify components for a growing ecommerce storefront, plus 15+ usability fixes across the live site.",
    preview: "none",
  },
];
