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
function ScanIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M3 12h18" />
    </svg>
  );
}
function LayersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 16l9 5 9-5" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}
function PulseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2 6 4-14 2 8h6" />
    </svg>
  );
}

const principles = [
  { icon: <ScanIcon />, title: "Scan, don’t read", body: "Hierarchy carries the meaning. Status reads at a glance through position, shape, and color together, never color alone." },
  { icon: <LayersIcon />, title: "One surface, whole operation", body: "Map, fleet, orders, exceptions, and KPIs share one screen without turning into noise. Density with air." },
  { icon: <BoltIcon />, title: "Act in seconds", body: "The two actions a dispatcher does most, assign and resolve, are one clear decision and one click." },
  { icon: <PulseIcon />, title: "Calm under live state", body: "Everything updates in real time, but change is noticed, not distracting. The screen stays legible while it moves." },
];

const frames = [
  {
    index: "01",
    title: "Dispatch overview",
    label: "Frame: dispatch overview",
    src: "/relay/dispatch-overview.png",
    body: "The command surface. A live map with driver and order pins, an order queue grouped by status, a fleet strip, a KPI bar (on-time %, active drivers, average time), and exception alerts, all readable in one glance.",
  },
  {
    index: "02",
    title: "Order & assignment",
    label: "Frame: order & assignment",
    src: "/relay/order-assignment.png",
    body: "One order in focus: an SLA countdown, a ranked list of suggested drivers with the reasons behind the ranking, a one-click assign action, and a full event timeline.",
  },
  {
    index: "03",
    title: "Driver detail",
    label: "Frame: driver detail",
    src: "/relay/driver-detail.png",
    body: "A single driver’s live route and stops, remaining capacity, and on-time record, so the dispatcher can trust a reassignment before they make it.",
  },
  {
    index: "04",
    title: "Exceptions queue",
    label: "Frame: exceptions queue",
    src: "/relay/exceptions-queue.png",
    body: "Problems as a triage table, ranked by severity and SLA-breach risk, with resolve actions inline. The riskiest items rise to the top so nothing slips.",
  },
];

const decisions = [
  { n: "01", title: "Status as one system", body: "Orders, drivers, and exceptions all speak the same visual language for state: a consistent pairing of shape, color, and label. Learn it once, read it everywhere." },
  { n: "02", title: "SLA as the spine", body: "Time-to-breach is the organizing signal across the whole console. The closest-to-breaking items surface first in every view, so attention goes where it matters." },
  { n: "03", title: "Assignment as a ranked decision", body: "Instead of a raw driver list, the console suggests the best options and shows why (proximity, capacity, on-time record). The dispatcher confirms judgment rather than doing the math." },
  { n: "04", title: "Exceptions as a queue, not alarms", body: "Problems don’t pile up as popups fighting for attention. They land in a triaged queue with clear next actions, so a bad moment stays manageable." },
];

export default function CaseStudyRelay() {
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
            <Eyebrow>Case Study · Product Design (Self-Directed)</Eyebrow>
            <h1 className="font-serif text-6xl md:text-7xl text-text leading-[1.02] mt-5 mb-8">
              Relay
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl">
              Designing a last-mile delivery operations console: a high-density,
              real-time surface a dispatcher can scan and operate under pressure.
            </p>

            <a
              href="https://author-sync-40384662.figma.site/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover-lift group mt-10 inline-flex items-center gap-2 w-fit bg-accent text-white border border-accent rounded-full px-6 py-3 text-sm tracking-wide hover:bg-accent-secondary hover:border-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View live prototype
              <span className="text-text/70">
                (dark mode)
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M18 6H8M18 6V16" />
              </svg>
            </a>

            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-8 mt-12 border-t border-border pt-10">
              {[
                ["Role", "Product Designer (self-directed)"],
                ["Type", "Personal project"],
                ["Surface", "Desktop operations console"],
                ["Focus", "Real-time information design"],
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
                A dispatcher has to track a live fleet and spot the one thing about to go wrong.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-label">What I did</p>
              <p className="text-sm text-text leading-relaxed">
                Self-directed: designed the full information hierarchy for a dense, real-time console.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-label">Result</p>
              <p className="text-sm text-text leading-relaxed">
                A complete four-screen design, published as a live, interactive prototype.
              </p>
            </div>
          </div>
        </section>

        {/* OVERVIEW */}
        <Section eyebrow="Overview" title="An operation you can run at a glance">
          <div className="flex flex-col gap-6 text-text-secondary leading-relaxed text-lg">
            <p>
              Relay is a self-directed exploration of one of the hardest problems
              in interface design: a last-mile delivery operations console. A
              dispatcher watches dozens of live orders, a fleet of drivers, and
              SLAs ticking down, while things constantly go wrong: delays, failed
              drops, traffic.
            </p>
            <p>
              The console has to show the whole operation at a glance and let the
              dispatcher act in seconds. High density, real-time state, and fast
              decisions under pressure, all on one screen. I took it on because
              it’s exactly the kind of surface where information design either
              works or falls apart.
            </p>
          </div>
        </Section>

        {/* PROBLEM */}
        <Section eyebrow="The Problem" title="Designed to be operated, not read">
          <div className="flex flex-col gap-8 text-text-secondary leading-relaxed text-lg">
            <p>
              A dispatcher isn’t studying this screen. They’re triaging it, many
              times a minute, while the situation keeps changing underneath them.
              If they have to stop and decode the interface, the operation slips.
            </p>
            <blockquote className="border-l-2 border-bronze pl-6 py-1">
              <p className="font-serif text-2xl md:text-3xl text-accent leading-snug italic">
                A dispatcher doesn’t read this screen. They scan it and act.
              </p>
            </blockquote>
            <p>
              So the whole design brief became a legibility problem: multiple
              entity types, live status everywhere, and the riskiest thing always
              visible, without the screen becoming a wall of noise. That is the
              craft that separates a surface that looks busy from one that can
              actually be run.
            </p>
          </div>
        </Section>

        {/* PRINCIPLES */}
        <Section eyebrow="Design Principles" title="Four rules that held the density together">
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
        <Section eyebrow="The Console" title="Four dense frames" wide>
          <p className="text-text-secondary leading-relaxed text-lg mb-16 max-w-[820px]">
            The system comes together across four desktop frames, each owning one
            part of the dispatcher’s job: see everything, assign the right driver,
            trust the reassignment, and clear the exceptions before they breach.
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
        <Section eyebrow="Learnings" title="What designing Relay taught me">
          <div className="flex flex-col gap-6 text-text-secondary leading-relaxed text-lg">
            <p>
              Relay pushed me to design for operators, not readers. When a screen
              has to be scanned and acted on under pressure, restraint becomes the
              hardest and most valuable move: every color, every border, and every
              number has to earn its place or it steals attention from the one
              thing that matters right now.
            </p>
            <p>
              It’s the craft I most want to keep sharpening: taking a dense,
              real-time, high-stakes surface and making it feel calm, scannable,
              and genuinely operable. That’s where interface design stops being
              decoration and starts being infrastructure.
            </p>
          </div>
        </Section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-[820px] mx-auto px-6 md:px-10 py-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-text-secondary/80 font-mono uppercase tracking-[0.15em]">
            Case study · Relay · Marzia Saidi
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
