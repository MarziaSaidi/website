// Unified "Selected Work" dataset. Every real project — internship or
// personal — lives here with two labels: `category` (what kind of work it
// was) and `context` (where it came from). No fabricated projects or
// metrics. `featured: true` gets the large typographic treatment.

export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "design-eng", label: "Design + Engineering" },
  { id: "product-design", label: "Product Design" },
  { id: "engineering", label: "Engineering" },
];

export const work = [
  {
    id: "quill-pigeon",
    name: "Quill & Pigeon",
    featured: true,
    context: "Internship",
    category: "engineering",
    oneLiner: "Automating recipient data entry for 100+ users",
    contribution:
      "Built an automated CSV/XLSX bulk-import pipeline with validation and address correction, plus an OAuth-synced reminder system and dynamic Open Graph image generation.",
    tags: ["React", "TypeScript", "Zod", "Google APIs"],
  },
  {
    id: "survue",
    name: "Survue",
    featured: true,
    context: "Internship",
    category: "design-eng",
    oneLiner: "Cyclist-safety alerts a rider can trust at a glance",
    contribution:
      "Led UX from journey maps through high-fidelity prototypes, then built the settings module in C# and .NET MAUI, releasing to 100+ early users across iOS, Android, and Windows.",
    tags: [".NET MAUI", "C#", "Figma"],
    href: "#/survue",
    hrefLabel: "Case study",
  },
  {
    id: "supportiq",
    name: "SupportIQ",
    featured: true,
    context: "Personal",
    category: "engineering",
    oneLiner: "An AI-powered, multi-tenant customer support platform",
    contribution:
      "Built a full-stack SaaS with a Spring Boot and PostgreSQL backend and a Next.js/TypeScript frontend, including a RAG pipeline over the OpenAI API secured with JWT and role-based access.",
    tags: ["Java", "Spring Boot", "PostgreSQL", "OpenAI API"],
    live: "https://supportiq-theta.vercel.app/",
  },
  {
    id: "relay",
    name: "Relay",
    context: "Personal",
    category: "product-design",
    oneLiner: "A real-time console for running a live delivery fleet",
    contribution:
      "Designed the information hierarchy for a high-density, real-time dispatch console.",
    tags: ["Figma", "Prototyping", "Information Design"],
    href: "#/relay",
    hrefLabel: "Case study",
    live: "https://author-sync-40384662.figma.site/",
  },
  {
    id: "chore-board",
    name: "Chore Board",
    context: "Personal",
    category: "design-eng",
    oneLiner: "Real-time task management for shared households",
    contribution:
      "Designed and built the full app: auth, real-time sync, and per-user permissions.",
    tags: ["Next.js", "TypeScript", "Supabase"],
    live: "https://choreboard-dun.vercel.app/",
    hrefLabel: "Live project",
  },
  {
    id: "solo-eats",
    name: "Solo Eats",
    context: "Personal",
    category: "design-eng",
    oneLiner: "AI-assisted meal planning for people cooking alone",
    contribution:
      "Designed and built a React Native app with AI-generated meal plans and shopping lists.",
    tags: ["React Native", "AI Integration"],
  },
  {
    id: "get-campus",
    name: "Get Campus",
    context: "Internship",
    category: "product-design",
    oneLiner: "Shipping MVP employer and customer platforms in ~4 weeks",
    contribution:
      "Owned end-to-end UX across onboarding, job posting, payments, and analytics, with Figma Dev Mode specs to streamline engineering handoff.",
    tags: ["Figma", "UX/UI Design", "Design Tokens"],
  },
  {
    id: "wildwood",
    name: "Wildwood Oyster Co.",
    context: "Internship",
    category: "engineering",
    oneLiner: "Faster, more usable ecommerce pages",
    contribution:
      "Built 5+ responsive pages and custom Shopify components, and resolved 15+ usability issues across the site.",
    tags: ["Shopify", "Responsive Design", "Performance Tuning"],
  },
];
