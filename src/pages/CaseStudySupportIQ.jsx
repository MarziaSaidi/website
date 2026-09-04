import { useEffect } from "react";
import TocSidebar from "../components/case-study/TocSidebar";
import MetadataFooter from "../components/case-study/MetadataFooter";
import ChatPreview from "../components/work/ChatPreview";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { scrollToHashedSectionOnLoad } from "../lib/scrollToSection";

/* ---- small building blocks (mirrors CaseStudyQalin.jsx's pattern) ---- */

function Eyebrow({ children, className = "" }) {
  return (
    <p className={`font-mono text-[0.7rem] md:text-xs uppercase tracking-eyebrow text-text-secondary ${className}`}>
      {children}
    </p>
  );
}

const TOC_SECTIONS = [
  { id: "the-problem", label: "The Problem" },
  { id: "the-system", label: "The System" },
];

export default function CaseStudySupportIQ() {
  useEffect(() => {
    window.scrollTo(0, 0);
    scrollToHashedSectionOnLoad();
  }, []);
  useDocumentMeta(
    "SupportIQ | Marzia Saidi",
    "A solo-built, multi-tenant AI support platform: RAG grounded in real order data, behind auth built to hold in production."
  );

  return (
    <div className="min-h-screen bg-background text-text">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <a
            href="#/"
            className="group inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Back to portfolio
          </a>
          <a href="#/" className="font-serif text-lg text-text tracking-wide">
            Marzia Saidi
          </a>
        </div>
      </header>

      <TocSidebar sections={TOC_SECTIONS} />

      <main>
        {/* HERO */}
        <section>
          <div className="max-w-5xl mx-auto px-6 md:px-10 pt-24 pb-[25px] md:pt-32">
            <Eyebrow className="enter enter-1">Case Study · AI · Full Stack (Solo Build)</Eyebrow>
            <h1 className="enter enter-2 font-display font-bold text-6xl md:text-7xl text-text leading-[1.02] mt-5 mb-2">
              SupportIQ
            </h1>
            <p className="enter enter-3 font-mono text-sm text-text-secondary/60 tabular-nums mb-8">
              May–July 2026 · Personal Project
            </p>
            <p className="enter enter-3 text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl">
              A solo-built, multi-tenant AI support platform: RAG grounded in
              real order data, behind auth built to hold in production.
            </p>

            <a
              href="https://supportiq-theta.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="enter enter-4 hover-lift group mt-10 inline-flex items-center gap-2 w-fit bg-button-primary-bg text-button-primary-text border border-button-primary-bg rounded-full px-6 py-3 text-sm tracking-wide hover:bg-button-primary-hover hover:border-button-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View live site
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M18 6H8M18 6V16" />
              </svg>
            </a>

            <dl className="enter enter-5 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-8 mt-12 border-t border-border pt-10">
              {[
                ["Role", "Full stack engineer & designer (solo)"],
                ["Type", "Personal project"],
                ["Stack", "Java · Spring Boot · React · Next.js"],
                ["Focus", "Production grade multi tenant SaaS"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1.5">
                  <dt className="font-mono text-[0.65rem] uppercase tracking-meta text-text-secondary">{k}</dt>
                  <dd className="text-sm text-text leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* PROBLEM — compact inline label, no separate heading/quote */}
        <section id="the-problem" className="mx-auto px-6 md:px-10 py-[25px] max-w-5xl scroll-mt-28">
          <p className="text-lg leading-relaxed max-w-[820px]">
            <span className="font-mono text-xs uppercase tracking-meta text-text-secondary mr-2">
              The Problem:
            </span>
            <span className="text-text-secondary">
              An AI that guesses convincingly is worse than no AI at all. And
              in multi-tenant software, one tenant seeing another's data
              isn't a bug, it's the product failing at its only
              non-negotiable job.
            </span>
          </p>
        </section>

        {/* THE SYSTEM */}
        <section id="the-system" className="mx-auto px-6 md:px-10 py-[25px] max-w-5xl scroll-mt-28">
          <p className="text-lg leading-relaxed mb-12 max-w-[820px]">
            <span className="font-mono text-xs uppercase tracking-meta text-text-secondary mr-2">
              The System:
            </span>
            <span className="text-text-secondary">
              One live assistant sits on a RAG pipeline reading real order
              data, wrapped in a tenant boundary that holds on every request,
              not just at login.
            </span>
          </p>

          <div className="max-w-md mx-auto mb-12">
            <ChatPreview />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 max-w-[820px] mx-auto">
            <p className="text-sm text-text-secondary leading-relaxed">
              <span className="block font-mono text-xs uppercase tracking-meta text-text-secondary mb-2">
                Grounded in real data
              </span>
              Function calling pulls the actual order record before the
              model answers, so "order #4521 shipped Tuesday" is a database
              read, not a guess.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              <span className="block font-mono text-xs uppercase tracking-meta text-text-secondary mb-2">
                Tenant isolation
              </span>
              JWT auth and role-based access run on every API route, not
              just the login screen — a support agent can't reach another
              tenant's tickets by editing a URL.
            </p>
          </div>
        </section>

        <section className="mx-auto px-6 md:px-10 py-[25px] max-w-5xl">
          <div className="max-w-[820px]">
            <MetadataFooter
              fields={[
                ["Last Updated", "July 2026"],
                ["Read Time", "1 min"],
                ["Word Count", "138"],
              ]}
            />
          </div>
        </section>
      </main>

      <footer>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-14 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-text-secondary/80 font-mono uppercase tracking-meta">
            Case study · SupportIQ · Marzia Saidi
          </p>
          <a
            href="#/"
            className="link-dotted text-sm text-text-secondary hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            Back to portfolio
          </a>
        </div>
      </footer>
    </div>
  );
}
