import { useEffect, useState } from "react";
import Reveal from "../components/ui/Reveal";

/* ---- small building blocks ---- */

function Eyebrow({ children }) {
  return (
    <p className="font-mono text-[0.7rem] md:text-xs uppercase tracking-[0.22em] text-[var(--world-accent,var(--color-label))]">
      {children}
    </p>
  );
}

function ImageIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l5-5 4 4 3-3 4 4" />
    </svg>
  );
}

/* Section wrapper: top rule + eyebrow + title, reveal-on-scroll. */
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

/* One dense desktop frame: number + title + description + wide image slot.
   The image auto-swaps in once the PNG exists at `src`; until then a labeled
   dashed slot holds the space so Figma exports drop straight in. */
function Frame({ index, title, label, src, children }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="flex flex-col gap-6">
      <figcaption className="flex gap-4 items-baseline max-w-[820px]">
        <span className="font-serif text-2xl md:text-3xl text-bronze tabular-nums leading-none">
          {index}
        </span>
        <div className="flex flex-col gap-2">
          <h3 className="font-serif text-xl md:text-2xl text-text leading-snug">{title}</h3>
          <p className="text-text-secondary leading-relaxed">{children}</p>
        </div>
      </figcaption>
      {failed ? (
        <div className="w-full aspect-[16/10] rounded-xl border border-border bg-paper/60 flex flex-col items-center justify-center gap-2.5 text-text-secondary text-center px-6">
          <ImageIcon />
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em]">{label}</span>
          <span className="text-[0.62rem] text-text-secondary/70">{src}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={label}
          width={2880}
          height={1800}
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-auto rounded-xl border border-border shadow-soft"
        />
      )}
    </figure>
  );
}

/* ---- principle icons ---- */
function TokenIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}
function SpecIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6l5 5v11a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2zM9 12h6M9 16h6M9 8h2" />
    </svg>
  );
}
function LoopIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4.5 9A8 8 0 0119.4 8.5M19.5 15A8 8 0 014.6 15.5" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </svg>
  );
}

const principles = [
  { icon: <TokenIcon />, title: "Tokens, not redlines", body: "Reusable components, auto layout, and design tokens engineers could map directly to code, so handoff wasn't a translation step." },
  { icon: <SpecIcon />, title: "Dev Mode as the source of truth", body: "Edge cases and states documented directly in Figma Dev Mode specs, working with the founders and engineers to define what each screen needed to handle." },
  { icon: <LoopIcon />, title: "Usability review, then iterate", body: "Every surface went through a review pass with stakeholders before it was called done, so feedback shaped the design before it shaped the backlog." },
  { icon: <ClockIcon />, title: "Four weeks, first prototype to production", body: "Speed was a real constraint, not a suggestion. It shaped scope: every screen had to earn its place before it got built." },
];

const frames = [
  {
    index: "01",
    title: "Dashboard overview",
    label: "Frame: dashboard overview",
    src: "/get-campus/dashboard-overview.png",
    body: "The employer's landing surface: active job postings, pending applications, response rate, and average time-to-hire, plus an applications trend chart and a ranked list of top-performing jobs.",
  },
  {
    index: "02",
    title: "Manage applications",
    label: "Frame: manage applications",
    src: "/get-campus/applications.png",
    body: "Every candidate across every listing in one filterable table: status (new, interview, shortlisted, rejected), years of experience, and a match score, so an employer can triage without opening each application.",
  },
  {
    index: "03",
    title: "Discover candidates",
    label: "Frame: discover candidates",
    src: "/get-campus/discover.png",
    body: "The proactive side of hiring: search and filter the full candidate pool by role, skill, experience, and availability, save profiles, and invite strong matches to apply instead of waiting on inbound.",
  },
  {
    index: "04",
    title: "Billing & student payments",
    label: "Frame: billing and student payments",
    src: "/get-campus/billing.png",
    body: "Plan and payment method for the employer, plus a separate ledger for paying the students they hire: total paid out, pending payments, and per-student, per-gig invoices.",
  },
];

const decisions = [
  { n: "01", title: "Status as one shared language", body: "Applications, candidates, and payments all use the same pairing of color and label for state, so an employer scanning any table already knows how to read it." },
  { n: "02", title: "Match score as the shortcut", body: "Instead of asking an employer to re-evaluate every resume, a single match percentage surfaces on both Applications and Discover, so attention goes to the strongest candidates first." },
  { n: "03", title: "Discovery as a parallel path to posting", body: "Not every good hire comes from someone applying. Discover lets an employer search and invite candidates directly, so hiring isn't blocked on waiting for inbound applications." },
  { n: "04", title: "Payments scoped to the employer's own view", body: "Billing keeps the employer's own subscription separate from what they owe the students they've hired, two different obligations that needed two different sections, not one merged table." },
];

export default function CaseStudyGetCampus() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            <Eyebrow>Case Study · Product Design (Internship)</Eyebrow>
            <h1 className="font-serif text-6xl md:text-7xl text-text leading-[1.02] mt-5 mb-8">
              Get Campus
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl">
              Designing the employer side of a student-gig marketplace: job
              posting, candidate discovery, applications, and billing, shipped
              as production-ready Figma specs working directly with the
              founders and engineers.
            </p>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-8 mt-14 border-t border-border pt-10">
              {[
                ["Role", "Product Designer (Internship)"],
                ["Team", "Founders + engineers"],
                ["Platform", "Web (employer dashboard)"],
                ["Timeline", "Jan – Apr 2026"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1.5">
                  <dt className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-label">{k}</dt>
                  <dd className="text-sm text-text leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* AT A GLANCE — the whole case study in three lines */}
        <section className="border-b border-border bg-background-secondary/40">
          <div className="max-w-[820px] mx-auto px-6 md:px-10 py-14 md:py-16 grid sm:grid-cols-3 gap-8 md:gap-10">
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-label">Problem</p>
              <p className="text-sm text-text leading-relaxed">
                An early-stage startup needed a working employer platform fast, with every screen handed to engineering build-ready, not still in flux.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-label">What I did</p>
              <p className="text-sm text-text leading-relaxed">
                Owned end-to-end UX for the employer side: flows, wireframes, high-fidelity prototypes, and Dev Mode specs, working directly with founders and engineers.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-label">Result</p>
              <p className="text-sm text-text leading-relaxed">
                Four production-ready surfaces, dashboard through billing, shipped from first prototype to spec in about four weeks.
              </p>
            </div>
          </div>
        </section>

        {/* OVERVIEW */}
        <Section eyebrow="Overview" title="The employer side of a two-sided marketplace">
          <div className="flex flex-col gap-6 text-text-secondary leading-relaxed text-lg">
            <p>
              Get Campus connects students to gig work, and employers to
              student talent, a two-sided platform with a companion
              student-facing app (New Start Mobile) on the other end. I owned
              the employer side: the dashboard, job posting, applications,
              candidate discovery, and billing, from first Figma prototype
              through developer handoff.
            </p>
            <p>
              This was an early-stage startup working at startup speed.
              Requirements moved as the founders learned what employers
              actually needed, so the job wasn't just designing screens, it
              was designing them in a way that could absorb change without
              losing craft or slowing engineering down.
            </p>
          </div>
        </Section>

        {/* PROBLEM */}
        <Section eyebrow="The Problem" title="Build-ready, not just look-ready">
          <div className="flex flex-col gap-8 text-text-secondary leading-relaxed text-lg">
            <p>
              A two-person founding team can't wait weeks for a polished mock
              before engineering starts building. Every screen I designed had
              to be usable as an actual spec: real components, real states,
              real edge cases, not just a static picture of the happy path.
            </p>
            <blockquote className="border-l-2 border-bronze pl-6 py-1">
              <p className="font-serif text-2xl md:text-3xl text-accent leading-snug italic">
                A design isn't done when it looks right. It's done when an
                engineer can build it without asking me what happens next.
              </p>
            </blockquote>
            <p>
              That reframed how I worked: less time perfecting a single frame
              in isolation, more time thinking through the states, filters,
              and empty cases each surface actually needed to ship.
            </p>
          </div>
        </Section>

        {/* PRINCIPLES */}
        <Section eyebrow="How I Worked" title="Four habits that kept design and build in sync">
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

        {/* THE FRAMES */}
        <Section eyebrow="The Platform" title="Four surfaces, one employer workflow" wide>
          <p className="text-text-secondary leading-relaxed text-lg mb-16 max-w-[820px]">
            The employer platform comes together across four core screens,
            each owning one part of hiring: see the state of your listings,
            review who applied, go find who hasn't applied yet, and pay the
            students you hire.
          </p>
          <div className="flex flex-col gap-20">
            {frames.map((f) => (
              <Frame key={f.index} index={f.index} title={f.title} label={f.label} src={f.src}>
                {f.body}
              </Frame>
            ))}
          </div>
        </Section>

        {/* KEY DECISIONS */}
        <Section eyebrow="Key Decisions" title="Where the design earned its keep" wide>
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
        <Section eyebrow="Learnings" title="What designing Get Campus taught me">
          <div className="flex flex-col gap-6 text-text-secondary leading-relaxed text-lg">
            <p>
              Working this close to the founders, with requirements shifting
              as they learned the market, taught me how directly a technical
              decision traces back to a user problem. A filter I added to
              Discover wasn't an abstract UX nicety, it was the difference
              between an employer finding a candidate this week or not at
              all.
            </p>
            <p>
              It's the discipline I most want to keep: design fast without
              designing loosely. Tokens, Dev Mode specs, and documented edge
              cases aren't extra steps, they're what let a startup move at
              its real speed without the design and the shipped product
              drifting apart.
            </p>
          </div>
        </Section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-[820px] mx-auto px-6 md:px-10 py-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-text-secondary/80 font-mono uppercase tracking-[0.15em]">
            Case study · Get Campus · Marzia Saidi
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
