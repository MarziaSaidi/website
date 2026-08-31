import { useEffect } from "react";
import Reveal from "../components/ui/Reveal";
import ChatPreview from "../components/work/ChatPreview";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

/* ---- small building blocks (mirrors CaseStudyQalin.jsx's pattern) ---- */

function Eyebrow({ children, className = "" }) {
  return (
    <p className={`font-mono text-[0.7rem] md:text-xs uppercase tracking-eyebrow text-[var(--world-accent,var(--color-label))] ${className}`}>
      {children}
    </p>
  );
}

function Section({ eyebrow, title, children, wide = false }) {
  return (
    <Reveal
      as="section"
      className={`mx-auto px-6 md:px-10 py-20 md:py-32 border-t border-border ${wide ? "max-w-5xl" : "max-w-[820px]"}`}
    >
      <div className="max-w-[820px] mb-10 md:mb-14">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="font-serif text-3xl md:text-4xl text-text leading-tight mt-4">
          {title}
        </h2>
      </div>
      {children}
    </Reveal>
  );
}

/* ---- principle icons ---- */
function TargetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}
function CheckShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}
function PipelineIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="3" y="4" width="6" height="6" rx="1" />
      <rect x="15" y="4" width="6" height="6" rx="1" />
      <rect x="9" y="14" width="6" height="6" rx="1" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v3a2 2 0 002 2h1M18 10v3a2 2 0 01-2 2h-1" />
    </svg>
  );
}

const principles = [
  { icon: <TargetIcon />, title: "Ground every answer in real data", body: "The assistant runs on a RAG pipeline (embeddings, vector search, function calling against the order database) so a reply cites an actual order instead of generating a plausible sounding guess." },
  { icon: <LockIcon />, title: "Isolate tenants everywhere, not just at the door", body: "JWT auth and role based access control run on every request, not just login. A support agent from one tenant can't reach another tenant's tickets by changing a URL or guessing an ID." },
  { icon: <CheckShieldIcon />, title: "Test the paths that can't fail silently", body: "Auth and data access logic are the two places a quiet bug becomes a real incident, so those are exactly where the JUnit and Mockito coverage lives, not spread evenly across the codebase." },
  { icon: <PipelineIcon />, title: "Ship it the way a real product ships", body: "Docker plus a GitHub Actions pipeline deploys the platform on its own, the same bar a team engineering org would hold this to, applied to a project built by one person." },
];

const decisions = [
  { n: "01", title: "RAG grounded in real data, not free form generation", body: "Function calling pulls the actual order record before the model answers: \"I see order #4521 shipped Tuesday\" is a database read, not a guess dressed up as one. That distinction is the entire trust argument for an AI support tool." },
  { n: "02", title: "JWT + role based access as the tenant boundary", body: "Multi tenant SaaS lives or dies on this one guarantee. Every API route checks role and tenant on the token, not just at the login screen. The boundary has to hold on every request, not just the first one." },
  { n: "03", title: "Automated tests where a silent failure is expensive", body: "JUnit and Mockito cover auth and data access first: the paths where a passing build with a broken guarantee is far worse than a build that fails loudly." },
  { n: "04", title: "A pipeline that deploys itself", body: "Docker and GitHub Actions turn \"it works on my machine\" into a repeatable deploy: the same infrastructure discipline a production team would expect, built and run by one person." },
];

export default function CaseStudySupportIQ() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useDocumentMeta(
    "SupportIQ | Marzia Saidi",
    "Building a multi tenant AI support platform alone, end to end: a RAG assistant that answers from real order data, behind auth and access control built to hold up in production."
  );

  return (
    <div data-world="gold" className="min-h-screen bg-background text-text">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <a
            href="#/work"
            className="group inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Back to portfolio
          </a>
          <a href="#/work" className="font-serif text-lg text-text tracking-wide">
            Marzia Saidi
          </a>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="border-b border-border">
          <div className="max-w-[820px] mx-auto px-6 md:px-10 pt-28 pb-20 md:pt-40 md:pb-28">
            <Eyebrow className="enter enter-1">Case Study · AI · Full Stack (Solo Build)</Eyebrow>
            <h1 className="enter enter-2 font-serif text-6xl md:text-7xl text-text leading-[1.02] mt-5 mb-8">
              SupportIQ
            </h1>
            <p className="enter enter-3 text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl">
              Building a multi tenant AI support platform alone, end to end: a
              RAG assistant that answers from real order data, behind auth and
              access control built to hold up in production, not just a demo.
            </p>

            <a
              href="https://supportiq-theta.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="enter enter-4 hover-lift group mt-10 inline-flex items-center gap-2 w-fit bg-button-primary-bg text-button-primary-text border border-button-primary-bg rounded-full px-6 py-3 text-sm tracking-wide hover:bg-button-primary-hover hover:border-button-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                  <dt className="font-mono text-[0.65rem] uppercase tracking-meta text-label">{k}</dt>
                  <dd className="text-sm text-text leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* AT A GLANCE */}
        <section className="border-b border-border bg-background-secondary/40">
          <div className="max-w-[820px] mx-auto px-6 md:px-10 py-14 md:py-16 grid sm:grid-cols-3 gap-8 md:gap-10">
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[0.65rem] uppercase tracking-meta text-label">Problem</p>
              <p className="text-sm text-text leading-relaxed">
                A support AI is only useful if its answers are grounded in
                real data, and its tenants can never see each other's.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[0.65rem] uppercase tracking-meta text-label">What I did</p>
              <p className="text-sm text-text leading-relaxed">
                Solo, no team, no handoff: designed and built the full
                stack, the RAG pipeline, auth, and the deploy pipeline.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[0.65rem] uppercase tracking-meta text-label">Result</p>
              <p className="text-sm text-text leading-relaxed">
                A live, tested, CI/CD deployed multi tenant platform,
                shipped, not just prototyped.
              </p>
            </div>
          </div>
        </section>

        {/* OVERVIEW */}
        <Section eyebrow="Overview" title="A platform, not a screen">
          <div className="flex flex-col gap-6 text-text-secondary leading-relaxed text-lg">
            <p>
              SupportIQ is an AI powered, multi tenant customer support
              platform: Java and Spring Boot on the backend, React and
              Next.js on the front, talking through secured REST APIs, with a
              RAG pipeline on the OpenAI API answering from real order data
              instead of guessing.
            </p>
            <p>
              I built it on my own (no team, no handoff) specifically to
              prove I could take a product from idea to something actually
              deployed. That meant the scope wasn't just "design a support
              chat UI." It was the whole system: the database, the tenant
              boundary, the model layer, the tests, and the pipeline that
              ships it.
            </p>
          </div>
        </Section>

        {/* PROBLEM */}
        <Section eyebrow="The Problem" title="An assistant that guesses is worse than no assistant">
          <div className="flex flex-col gap-8 text-text-secondary leading-relaxed text-lg">
            <p>
              A support AI that answers confidently and wrong is a liability,
              not a feature. A customer asking about order #4521 needs an
              answer sourced from order #4521, not a fluent sounding
              hallucination. And a multi tenant platform that lets one
              tenant's data leak into another's isn't a bug, it's the product
              failing at its one non negotiable job.
            </p>
            <blockquote className="border-l-2 border-bronze pl-6 py-1">
              <p className="font-serif text-2xl md:text-3xl text-accent leading-snug italic">
                The two things a support platform can never get wrong are
                what it says and who it says it to.
              </p>
            </blockquote>
            <p>
              So the build had two non negotiables from the start: every
              answer has to be traceable to a real record, and every request
              has to be checked against who's actually asking. Everything
              else (the interface, the chat flow, the tenant dashboard) sits
              on top of those two guarantees.
            </p>
          </div>
        </Section>

        {/* PRINCIPLES */}
        <Section eyebrow="Engineering Principles" title="Four rules for a support AI you can actually trust">
          <div className="grid gap-6 md:gap-8 sm:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title} className="bg-paper border border-border rounded-xl shadow-soft p-6 flex flex-col gap-3">
                <span className="text-accent">{p.icon}</span>
                <h3 className="font-serif text-xl text-text">{p.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* THE SYSTEM */}
        <Section eyebrow="The System" title="One assistant, three layers underneath it" wide>
          <p className="text-text-secondary leading-relaxed text-lg mb-14 max-w-[820px]">
            SupportIQ isn't a multi screen interface tour. It's one focused
            surface (the ticket assistant) sitting on top of a stack most
            visitors never see: the access boundary that keeps tenants apart,
            and the pipeline that ships changes to it. The assistant below is
            the real interaction, not a mockup.
          </p>

          <div className="max-w-md mx-auto mb-16">
            <ChatPreview />
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h3 className="font-serif text-xl text-text">The access boundary</h3>
              <p className="text-text-secondary leading-relaxed">
                JWT auth and role based access control sit in front of every
                API route: the layer that decides what a request is even
                allowed to touch before the RAG pipeline runs at all.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-serif text-xl text-text">The pipeline</h3>
              <p className="text-text-secondary leading-relaxed">
                Docker packages the app the same way in every environment;
                GitHub Actions runs the JUnit/Mockito suite and deploys on a
                push: the part of "shipping software" that has nothing to
                do with the interface at all.
              </p>
            </div>
          </div>
        </Section>

        {/* KEY DECISIONS */}
        <Section eyebrow="Key Decisions" title="Where the engineering earned its keep" wide>
          <ol className="grid gap-x-12 gap-y-12 md:gap-y-14 sm:grid-cols-2">
            {decisions.map((d) => (
              <li key={d.n} className="flex gap-5">
                <span className="font-serif text-3xl text-bronze tabular-nums leading-none pt-1">
                  {d.n}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-serif text-xl md:text-2xl text-text leading-snug">{d.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{d.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* LEARNINGS */}
        <Section eyebrow="Learnings" title="What building SupportIQ taught me">
          <div className="flex flex-col gap-6 text-text-secondary leading-relaxed text-lg">
            <p>
              Owning this end to end (backend, frontend, deployment) showed
              me I don't just design interfaces. I can ship the product
              behind them too.
            </p>
            <p>
              Design and engineering stopped feeling like two different
              projects on this one. The interface decisions (what the
              assistant says, how confident it sounds) and the engineering
              decisions (what data it's actually allowed to say that from)
              were the same decision, looked at from two sides.
            </p>
          </div>
        </Section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-[820px] mx-auto px-6 md:px-10 py-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-text-secondary/80 font-mono uppercase tracking-meta">
            Case study · SupportIQ · Marzia Saidi
          </p>
          <a
            href="#/work"
            className="text-sm text-accent hover:text-accent-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
          >
            Back to portfolio
          </a>
        </div>
      </footer>
    </div>
  );
}
