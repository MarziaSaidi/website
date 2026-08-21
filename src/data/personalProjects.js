// Solo projects with real build detail — not internships, so they don't
// belong in data/experience.js's internship timeline, but get the same
// depth of case-study content (SimpleCaseStudy.jsx reads both).
export const personalProjects = [
  {
    projectId: "supportiq",
    label: "Personal Project",
    intro:
      "I built SupportIQ on my own — no team, no handoff — to prove I could take a product from idea to something actually deployed. It's a multi-tenant AI support platform: Java and Spring Boot on the backend, React and Next.js on the front, and a RAG pipeline that answers from real order data instead of guessing.",
    bulletsLabel: "What I built:",
    bullets: [
      "A full-stack, multi-tenant SaaS platform — Java, Spring Boot, and PostgreSQL on the backend, React, Next.js, and TypeScript on the front, talking through secured REST APIs.",
      "A RAG pipeline on the OpenAI API — embeddings, vector search, function calling — so the assistant cites real data instead of making things up.",
      "JWT auth and role-based access control, so every tenant only ever sees their own data.",
      "JUnit and Mockito tests, plus a Docker and GitHub Actions pipeline that deploys the whole thing on its own.",
    ],
    techStack: [
      "Java",
      "Spring Boot",
      "Spring Security",
      "PostgreSQL",
      "React",
      "Next.js",
      "TypeScript",
      "OpenAI API",
      "Docker",
      "GitHub Actions",
    ],
    lesson: {
      text: "Owning this end to end — backend, frontend, deployment — showed me I don't just design interfaces. I can ship the product behind them too.",
    },
  },
];
