import { useEffect, useState } from "react";
import Reveal from "../components/ui/Reveal";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

/* ---- small building blocks ---- */

function Eyebrow({ children, className = "" }) {
  return (
    <p className={`font-mono text-[0.7rem] md:text-xs uppercase tracking-eyebrow text-[var(--world-accent,var(--color-label))] ${className}`}>
      {children}
    </p>
  );
}

function ImageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l5-5 4 4 3-3 4 4" />
    </svg>
  );
}

/* Compact swap-in slot for a screen not yet provided. */
function Placeholder({ label, sub }) {
  return (
    <div className="w-full max-w-[180px] mx-auto aspect-[9/19] rounded-xl border border-border bg-paper/60 flex flex-col items-center justify-center gap-2.5 text-text-secondary px-4 text-center">
      <ImageIcon />
      <span className="font-mono text-[0.62rem] uppercase tracking-meta">{label}</span>
      {sub && <span className="text-[0.7rem] leading-relaxed text-text-secondary/80">{sub}</span>}
    </div>
  );
}

/* Real screenshot with graceful fallback: shows a labeled slot until the PNG
   exists at `src`, then swaps to the real image automatically. */
function Screenshot({ src, label, caption, width, height }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="flex flex-col gap-3 w-full max-w-[118px] md:max-w-[150px] mx-auto">
      {failed ? (
        <div className="w-full aspect-[9/19] rounded-xl border border-border bg-paper/60 flex flex-col items-center justify-center gap-2 text-text-secondary px-2 text-center">
          <ImageIcon />
          <span className="font-mono text-[0.55rem] uppercase tracking-meta">{label}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={label}
          width={width}
          height={height}
          loading="lazy"
          onError={() => setFailed(true)}
          className="w-full h-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.55)]"
        />
      )}
      {caption && (
        <figcaption className="text-xs text-text-secondary text-center leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* Section wrapper: top rule + eyebrow + title, reveal-on-scroll, reading column. */
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

/* ---- constraint icons ---- */
function EyeOff() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.9 5.1A9.5 9.5 0 0112 5c5 0 9 4.5 9 7-.4 1-1.2 2.1-2.3 3M6.2 6.2C3.7 7.7 2.3 9.9 2 12c.6 1.6 4 7 10 7 1.6 0 3-.4 4.2-1M4 4l16 16" />
    </svg>
  );
}
function HandsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V6.5a1.5 1.5 0 013 0V11m0-.5V5a1.5 1.5 0 013 0v6m0-.5V7a1.5 1.5 0 013 0v6.5a6 6 0 01-6 6H10a4 4 0 01-2.8-1.2L3.6 14.6a1.6 1.6 0 012.3-2.2L8 14.5" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  );
}

const constraints = [
  { icon: <EyeOff />, title: "Eyes off the screen", body: "The rider is watching traffic. Information has to land through glance, sound, or feel, not reading." },
  { icon: <HandsIcon />, title: "Hands occupied", body: "On the handlebars. Any in ride interaction must be near zero, ideally none at all." },
  { icon: <SunIcon />, title: "Harsh conditions", body: "Bright sun, motion, gloves. High contrast and large targets aren’t optional; they’re safety critical." },
];

const journey = ["Onboarding", "Device pairing", "Start ride", "Vehicle detected", "Safety alert"];

const decisions = [
  { n: "01", title: "The alert speaks before it shows", body: "The primary channel is sound and haptics; the screen is the backup, not the point. A rider is warned whether or not they ever glance down. The visual just confirms what they already felt." },
  { n: "02", title: "One glance = one meaning", body: "The visual alert is a single high contrast state a rider can decode instantly, with no text to parse and no ambiguity. Designed to survive sunlight, motion, and a quarter second look." },
  { n: "03", title: "Zero in ride interaction", body: "Nothing to tap while riding. All configuration lives in setup and settings, so the ride experience stays fully hands free." },
  { n: "04", title: "Make pairing feel safe, not technical", body: "Connecting hardware is where users abandon. I designed the pairing flow to be guided and reassuring, turning a technical step into a confidence building one." },
];

export default function CaseStudySurvue() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useDocumentMeta(
    "Survue | Marzia Saidi",
    "Leading UX for a cyclist safety app: designing calm, glanceable alerts a rider can trust while their eyes stay on the road."
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
            <Eyebrow className="enter enter-1">Case Study · Mobile UX Design</Eyebrow>
            <h1 className="enter enter-2 font-serif text-6xl md:text-7xl text-text leading-[1.02] mt-5 mb-8">
              Survue
            </h1>
            <p className="enter enter-3 text-lg md:text-xl text-text-secondary leading-relaxed max-w-xl">
              Leading UX for a cyclist safety app: designing calm, glanceable
              alerts a rider can trust while their eyes stay on the road.
            </p>

            <dl className="enter enter-4 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-8 mt-14 border-t border-border pt-10">
              {[
                ["Role", "Lead UX Designer & Mobile Dev"],
                ["Team", "3 engineers"],
                ["Platform", "iOS · Android · Windows"],
                ["Timeline", "Sep to Dec 2024"],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1.5">
                  <dt className="font-mono text-[0.65rem] uppercase tracking-meta text-label">{k}</dt>
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
              <p className="font-mono text-[0.65rem] uppercase tracking-meta text-label">Problem</p>
              <p className="text-sm text-text leading-relaxed">
                A rear vehicle alert has to be absorbed without taking a rider’s eyes off the road.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[0.65rem] uppercase tracking-meta text-label">What I did</p>
              <p className="text-sm text-text leading-relaxed">
                Led UX for the full app and built the cross platform settings module in .NET MAUI.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[0.65rem] uppercase tracking-meta text-label">Result</p>
              <p className="text-sm text-text leading-relaxed">
                Shipped to production across iOS, Android, and Windows with full feature parity.
              </p>
            </div>
          </div>
        </section>

        {/* OVERVIEW */}
        <Section eyebrow="Overview" title="Safety you feel, not a screen you watch">
          <div className="flex flex-col gap-6 text-text-secondary leading-relaxed text-lg">
            <p>
              Survue is a mobile app that warns cyclists about vehicles
              approaching from behind. I led the UX end to end, from user
              journeys through onboarding, device pairing, ride monitoring, and
              the safety alerts themselves, and built the cross platform settings
              module in .NET MAUI.
            </p>
            <p>
              The central design tension was unusual: the app is most important
              exactly when the user can’t look at it. Every decision had to serve
              a person in motion, in traffic, with their attention rightly on the
              road.
            </p>
          </div>
        </Section>

        {/* PROBLEM */}
        <Section eyebrow="The Problem" title="The rider’s attention belongs on the road">
          <div className="flex flex-col gap-8 text-text-secondary leading-relaxed text-lg">
            <p>
              Cyclists have almost no reliable awareness of what’s coming up
              behind them. A safety app could close that gap, but only if it
              delivers a warning the rider can absorb in a fraction of a second,
              without pulling focus from riding.
            </p>
            <blockquote className="border-l-2 border-bronze pl-6 py-1">
              <p className="font-serif text-2xl md:text-3xl text-accent leading-snug italic">
                A safety alert that demands attention to read is a safety alert
                that fails.
              </p>
            </blockquote>
            <p>
              That reframed the whole project. This wasn’t a screen design
              problem; it was a problem of designing for divided attention under
              real stakes.
            </p>
          </div>
        </Section>

        {/* CONSTRAINTS */}
        <Section eyebrow="Constraints" title="Designing for the worst case moment">
          <p className="text-text-secondary leading-relaxed text-lg mb-12">
            I mapped the real context of use and let its constraints drive the
            design:
          </p>
          <div className="grid gap-6 md:gap-8 sm:grid-cols-3">
            {constraints.map((c) => (
              <div key={c.title} className="bg-paper border border-border rounded-xl shadow-soft p-6 flex flex-col gap-3">
                <span className="text-accent">{c.icon}</span>
                <h3 className="font-serif text-xl text-text">{c.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* RESEARCH */}
        <Section eyebrow="Process · Research" title="Mapping the ride, end to end" wide>
          <p className="text-text-secondary leading-relaxed text-lg mb-12 max-w-[820px]">
            Before designing screens, I mapped the full journey to find where
            design actually mattered. The setup moments (onboarding, pairing)
            could be rich and guided; the in ride moment had to be nearly
            invisible. Naming that split up front kept the whole team aligned on
            where to spend effort.
          </p>

          {/* Journey strip */}
          <ol className="flex items-stretch gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {journey.map((step, i) => (
              <li key={step} className="flex items-center gap-2 shrink-0">
                <div className="bg-paper border border-border rounded-lg px-4 py-3 flex flex-col gap-1 min-w-[8.5rem]">
                  <span className="font-mono text-[0.65rem] text-label tracking-widest">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm text-text font-medium">{step}</span>
                </div>
                {i < journey.length - 1 && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="text-bronze shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                  </svg>
                )}
              </li>
            ))}
          </ol>
        </Section>

        {/* EXPLORATION */}
        <Section eyebrow="Process · Exploration" title="From wireframes to a tested direction">
          <p className="text-text-secondary leading-relaxed text-lg">
            I explored the setup flows as conventional guided screens, then spent
            most of my exploration on the hardest surface: the alert. I sketched
            multiple alert modalities (full screen color, directional indicator,
            audio led, haptic led) and weighed each against the one question that
            mattered: can a rider act on this in under a second without looking?
          </p>
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

        {/* FINAL DESIGNS */}
        <Section eyebrow="Final Designs" title="The shipped experience" wide>
          <p className="text-text-secondary leading-relaxed text-lg mb-12 max-w-[820px]">
            The final designs carried across iOS, Android, and Windows with full
            feature parity. I built the settings module in .NET MAUI so the
            components behaved consistently on every platform while respecting
            each one’s conventions.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-12 md:gap-y-14 justify-items-center">
            <Screenshot
              src="/survue/pairing.webp"
              label="Final: device pairing"
              width={625}
              height={1278}
              caption="Guided pairing: the device, its charge, and a single Connect action."
            />
            <Screenshot
              src="/survue/home-screen.webp"
              label="Final: ride monitoring"
              width={624}
              height={1277}
              caption="The active ride view: live rear monitoring with a Gallery / Detection / Settings base."
            />
            <Screenshot
              src="/survue/ride-monitoring.webp"
              label="Final: vehicle detected"
              width={628}
              height={1278}
              caption="The live alert: red road framing, the vehicle in alert red, and one plain language risk level, readable in the quarter second a rider can spare."
            />
            <Screenshot
              src="/survue/recordings.webp"
              label="Final: automatic recordings"
              width={626}
              height={1277}
              caption="Auto saved ride clips, timestamped, one tap to keep or delete."
            />
            <Screenshot
              src="/survue/settings.webp"
              label="Final: settings"
              width={625}
              height={1277}
              caption={
                <>
                  The settings module I built in .NET MAUI: theme, sound,
                  warnings, help.
                  <span className="block mt-1.5 text-xs italic text-text-secondary">
                    Shown in Light Mode. Survue was prototyped in both dark and
                    light themes.
                  </span>
                </>
              }
            />
          </div>
        </Section>

        {/* OUTCOME */}
        <Section eyebrow="Outcome & Learnings" title="What shipped, and what it taught me">
          <div className="flex flex-col gap-10 text-text-secondary leading-relaxed text-lg">
            <p>
              Collaborating with a three person engineering team, I translated the
              UX into production ready features and shipped a settings experience
              with parity across three platforms.
            </p>

            <div className="flex flex-col gap-4">
              <h3 className="font-serif text-2xl text-text">What I took from it</h3>
              <p>
                Survue taught me to design from the context of use outward, not
                from the screen inward. The best decision on the project, leading
                with sound and haptics instead of visuals, only became obvious
                once I took the rider’s real situation seriously. It’s the lesson I
                bring to every product since: understand the moment the person is
                actually in, then design the smallest thing that helps.
              </p>
            </div>
          </div>
        </Section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-[820px] mx-auto px-6 md:px-10 py-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-text-secondary/80 font-mono uppercase tracking-meta">
            Case study · Survue · Marzia Saidi
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
