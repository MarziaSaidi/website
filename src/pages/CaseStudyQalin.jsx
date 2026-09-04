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

/* Real screenshot with graceful fallback: shows a labeled slot until the PNG
   exists at `src`, then swaps to the real image automatically. Qalin's
   exports already have a device frame baked in, so no CSS border is drawn
   here — same convention as Survue's case study. */
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
          className="w-full h-auto object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
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

/* ---- principle icons ---- */
function FrameIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15l5-5 4 4 4-4 5 5" />
      <circle cx="9" cy="8" r="1.4" />
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
function TagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.6 12.1L12.9 4.4a2 2 0 00-1.4-.6H5a1 1 0 00-1 1v6.5c0 .5.2 1 .6 1.4l7.7 7.7a2 2 0 002.8 0l5.5-5.5a2 2 0 000-2.8z" />
      <circle cx="8.5" cy="8.5" r="1.4" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  );
}

const principles = [
  { icon: <FrameIcon />, title: "Let the object sell itself", body: "Full bleed rug photography carries the home page, the grid, and the product page. Copy stays minimal, because pattern and craftsmanship are the actual argument." },
  { icon: <LayersIcon />, title: "Filter by feel, not just facet", body: "Traditional, Modern, Transitional, Abstract, Irregular sit above material and size in the filter menu, because a buyer pictures a room's mood before they picture a knot count." },
  { icon: <TagIcon />, title: "Price with its reason", body: "Construction (hand knotted wool, hand tufted, pure silk) sits next to every price, everywhere in the app, so a $48,263 rug reads as earned value, not sticker shock." },
  { icon: <ShieldIcon />, title: "A calm, short path to buy", body: "Cart, checkout, and confirmation stay to three uninterrupted screens, with sizing and payment specifics visible the whole way. Restraint reads as trustworthy at this price point." },
];

const decisions = [
  { n: "01", title: "Photography does the persuading, not the copy", body: "Home's hero banner is the rug photograph itself. The product page backs it with a four shot detail gallery (weave, corner, motif, fringe) instead of one hero image, because texture and knot density are what a buyer needs to trust sight unseen." },
  { n: "02", title: "Style first navigation, layered over category", body: "The filter menu organizes by design language first, with Carpet / Rug / Cushion product type as its own, secondary tab set, so someone browsing for “something modern” never has to first decide what kind of object they're even looking for." },
  { n: "03", title: "Construction stays paired with price, always", body: "Every card, everywhere in the catalog, shows material and technique directly under the price. That pairing is what turns a five figure number into a legible decision instead of a moment of sticker shock." },
  { n: "04", title: "Checkout stays boring on purpose", body: "One address, one saved card, one line item, one total, one button. No multi step wizard, no upsell modules. At this price point, restraint reads as trustworthy, not as a missed opportunity." },
];

export default function CaseStudyQalin() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useDocumentMeta(
    "Qalin | Marzia Saidi",
    "Designing a mobile marketplace for hand knotted rugs and carpets: a shopping flow that has to build trust in an object worth thousands, through nothing but a phone screen."
  );

  return (
    <div data-world="gold" className="min-h-screen bg-background text-text">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <a
            href="#/"
            className="group inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
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

      <main>
        {/* HERO */}
        <section className="border-b border-border">
          <div className="max-w-[820px] mx-auto px-6 md:px-10 pt-28 pb-20 md:pt-40 md:pb-28">
            <Eyebrow className="enter enter-1">Case Study · Mobile UX Design (Self Directed)</Eyebrow>
            <h1 className="enter enter-2 font-serif text-6xl md:text-7xl text-text leading-[1.02] mt-5 mb-8">
              Qalin
            </h1>
            <p className="enter enter-3 text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl">
              Designing a mobile marketplace for hand knotted rugs and carpets:
              a shopping flow that has to build trust in an object worth
              thousands, through nothing but a phone screen.
            </p>

            <a
              href="https://www.figma.com/proto/q4P5mnsLxtcWBoRE3RM35B/Qalin?node-id=1-325&t=lPzof9zPT2ddRhA3-0&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A325"
              target="_blank"
              rel="noopener noreferrer"
              className="enter enter-4 hover-lift group mt-10 inline-flex items-center gap-2 w-fit bg-button-primary-bg text-button-primary-text border border-button-primary-bg rounded-full px-6 py-3 text-sm tracking-wide hover:bg-button-primary-hover hover:border-button-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View live prototype
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M18 6H8M18 6V16" />
              </svg>
            </a>

            <dl className="enter enter-5 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-8 mt-12 border-t border-border pt-10">
              {[
                ["Role", "Product Designer (self directed)"],
                ["Type", "Personal project"],
                ["Platform", "iOS · mobile commerce"],
                ["Focus", "Trust design at a high price point"],
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
                A rug priced from $720 to $86,000+ has to earn trust through a
                phone screen, with no showroom and nothing to touch.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[0.65rem] uppercase tracking-meta text-label">What I did</p>
              <p className="text-sm text-text leading-relaxed">
                Self directed: designed the full ten screen shopping
                experience, from discovery through checkout.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-mono text-[0.65rem] uppercase tracking-meta text-label">Result</p>
              <p className="text-sm text-text leading-relaxed">
                A complete, photography led purchase flow, published as a
                live, interactive prototype.
              </p>
            </div>
          </div>
        </section>

        {/* OVERVIEW */}
        <Section eyebrow="Overview" title="Ecommerce at the top of the price ladder">
          <div className="flex flex-col gap-6 text-text-secondary leading-relaxed text-lg">
            <p>
              Qalin is a self directed exploration of mobile commerce for
              hand knotted wool and silk rugs and carpets, priced anywhere
              from $720 to $86,000 and up. I designed the full ten screen
              experience (home, browse, search, style filtering, product
              detail, cart, checkout, and confirmation) as a live,
              interactive prototype.
            </p>
            <p>
              Most ecommerce patterns assume the buyer already trusts the
              object. Here, the object is the entire problem: a rug is
              texture, weight, and craftsmanship, none of which survive a
              small photo well, and the price tag means a wrong guess costs
              real money. Every screen had to work against that gap.
            </p>
          </div>
        </Section>

        {/* PROBLEM */}
        <Section eyebrow="The Problem" title="A five figure tap needs evidence, not persuasion">
          <div className="flex flex-col gap-8 text-text-secondary leading-relaxed text-lg">
            <p>
              A shopper can't run a hand across a rug's pile through a phone
              screen, can't gauge how a $48,263 hand knotted piece will
              actually sit in their dining room, and has no in store expert
              standing next to them. At the price points Qalin sells at,
              hesitation isn't a UX inconvenience, it's the sale.
            </p>
            <blockquote className="border-l-2 border-bronze pl-6 py-1">
              <p className="font-serif text-2xl md:text-3xl text-accent leading-snug italic">
                A rug this expensive isn't bought on a hunch. It's bought on
                evidence.
              </p>
            </blockquote>
            <p>
              So the design question wasn't “how do we get someone to check
              out faster.” It was “what does someone need to see, and in what
              order, before a five figure tap feels reasonable.” That
              reframing shaped everything from the home page's full bleed
              photography to the checkout screen's total silence on anything
              but the order itself.
            </p>
          </div>
        </Section>

        {/* PRINCIPLES */}
        <Section eyebrow="Design Principles" title="Four rules for selling what a screen can't fully show">
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

        {/* THE SCREENS */}
        <Section eyebrow="The App" title="Ten screens, one purchase" wide>
          <p className="text-text-secondary leading-relaxed text-lg mb-16 max-w-[820px]">
            The flow moves a shopper from a wall of unfamiliar patterns to a
            confident purchase in three stages: discover the catalog and
            narrow it down, decide on one piece with real detail to back the
            price, then buy without friction or surprises.
          </p>

          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-8">
              <h3 className="font-serif text-xl md:text-2xl text-text">Discover</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-12 justify-items-center">
                <Screenshot
                  src="/qalin/Home.webp"
                  label="Home"
                  width={633}
                  height={1280}
                  caption="The rug itself is the hero image, with a single Explore Collection action. No scrolling required to see something worth thousands."
                />
                <Screenshot
                  src="/qalin/2.webp"
                  label="New arrivals"
                  width={633}
                  height={1280}
                  caption="Carpet / Rug / Cushion tabs sit directly under the hero, so browsing starts in the same scroll instead of a separate step."
                />
                <Screenshot
                  src="/qalin/4.webp"
                  label="Style filter menu"
                  width={633}
                  height={1280}
                  caption="Filters run by design language: Traditional, Modern, Abstract, Irregular, because that's how a buyer pictures a room first."
                />
                <Screenshot
                  src="/qalin/9.webp"
                  label="Search results"
                  width={633}
                  height={1280}
                  caption="Live result counts and inline sort / filter / view controls stay anchored to the search bar while narrowing a wide catalog."
                />
                <Screenshot
                  src="/qalin/3.webp"
                  label="Contact & trust"
                  width={633}
                  height={1280}
                  caption="Phone number, hours, and a store locator sit one scroll below the catalog, reachable the moment someone wants a human."
                />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <h3 className="font-serif text-xl md:text-2xl text-text">Decide</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-12 justify-items-center">
                <Screenshot
                  src="/qalin/5.webp"
                  label="Full catalog grid"
                  width={633}
                  height={1280}
                  caption="Construction and price sit together on every card: hand knotted wool at $48,263 next to hand tufted wool at $720, so value is legible before a tap."
                />
                <Screenshot
                  src="/qalin/6.webp"
                  label="Product detail"
                  width={633}
                  height={1280}
                  caption="A four shot detail gallery (weave, corner, motif, fringe) plus exact rug size in feet and centimeters, above one Add to Basket action."
                />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <h3 className="font-serif text-xl md:text-2xl text-text">Buy</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-12 justify-items-center">
                <Screenshot
                  src="/qalin/7.webp"
                  label="Cart"
                  width={633}
                  height={1280}
                  caption="Quantity steppers and a plain subtotal, with a note that shipping and tax resolve at checkout: the number shown is incomplete, never wrong."
                />
                <Screenshot
                  src="/qalin/8.webp"
                  label="Checkout"
                  width={633}
                  height={1280}
                  caption="Address, saved card, and the order line sit in one uninterrupted view: no steps, no upsells, one Buy Now."
                />
                <Screenshot
                  src="/qalin/10.webp"
                  label="Payment success"
                  width={633}
                  height={1280}
                  caption="A payment ID for the record a five figure purchase deserves, a one tap satisfaction check, and a clear way back to browsing."
                />
              </div>
            </div>
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
        <Section eyebrow="Learnings" title="What designing Qalin taught me">
          <div className="flex flex-col gap-6 text-text-secondary leading-relaxed text-lg">
            <p>
              Above a certain price point, an interface's job changes. It
              stops trying to persuade and starts trying to reassure. The
              hero photography, the detail gallery, the construction label
              sitting next to every price, none of it was decoration; it was
              the evidence a buyer needed before trusting a screen with a
              $48,263 decision.
            </p>
            <p>
              It's a different kind of restraint than a typical checkout
              flow chases: not fewer steps for the sake of speed, but fewer
              surprises for the sake of confidence. That's the lesson I'd
              carry into any product where the stakes on a single purchase
              are high: match the interface's caution to the size of the
              decision it's asking someone to make.
            </p>
          </div>
        </Section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-[820px] mx-auto px-6 md:px-10 py-14 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-text-secondary/80 font-mono uppercase tracking-meta">
            Case study · Qalin · Marzia Saidi
          </p>
          <a
            href="#/"
            className="text-sm text-accent hover:text-accent-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
          >
            Back to portfolio
          </a>
        </div>
      </footer>
    </div>
  );
}
