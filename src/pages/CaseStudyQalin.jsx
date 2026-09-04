import { useEffect, useState } from "react";
import AnchorHeading from "../components/case-study/AnchorHeading";
import TocSidebar from "../components/case-study/TocSidebar";
import Lightbox from "../components/case-study/Lightbox";
import MetadataFooter from "../components/case-study/MetadataFooter";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { scrollToHashedSectionOnLoad } from "../lib/scrollToSection";

/* ---- small building blocks ---- */

function Eyebrow({ children, className = "" }) {
  return (
    <p className={`font-mono text-[0.7rem] md:text-xs uppercase tracking-eyebrow text-text-secondary ${className}`}>
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
   exists at `src`, then swaps to the real image automatically. No border or
   card chrome — the export already has its own device frame baked in, so
   adding one just traces a rectangle around the transparent margin. */
function Screenshot({ src, label, caption, width, height, onOpen }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className="flex flex-col gap-3 w-full max-w-[118px] md:max-w-[150px] mx-auto">
      {failed ? (
        <div className="w-full aspect-[9/19] border border-border bg-surface flex flex-col items-center justify-center gap-2 text-text-secondary px-2 text-center">
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
          onClick={() => onOpen({ src, label })}
          className="w-full h-auto object-contain cursor-zoom-in opacity-100 hover:opacity-80 transition-opacity"
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

const TOC_SECTIONS = [
  { id: "the-problem", label: "The Problem" },
  {
    id: "the-app",
    label: "The App",
    children: [
      { id: "discover", label: "Discover" },
      { id: "decide", label: "Decide" },
      { id: "buy", label: "Buy" },
    ],
  },
];

export default function CaseStudyQalin() {
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    scrollToHashedSectionOnLoad();
  }, []);
  useDocumentMeta(
    "Qalin | Marzia Saidi",
    "Designing a mobile marketplace for hand knotted rugs and carpets: a shopping flow that has to build trust in an object worth thousands, through nothing but a phone screen."
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
            <Eyebrow className="enter enter-1">Case Study · Mobile UX Design (Self Directed)</Eyebrow>
            <h1 className="enter enter-2 font-display font-bold text-6xl md:text-7xl text-text leading-[1.02] mt-5 mb-2">
              Qalin
            </h1>
            <p className="enter enter-3 font-mono text-sm text-text-secondary/60 tabular-nums mb-8">
              Aug 2026 · Personal Project
            </p>
            <p className="enter enter-3 text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl">
              A mobile marketplace for rugs priced $720–$86,000+, designed to
              build purchase trust through nothing but a phone screen.
            </p>

            <a
              href="https://www.figma.com/proto/q4P5mnsLxtcWBoRE3RM35B/Qalin?node-id=1-325&t=lPzof9zPT2ddRhA3-0&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A325"
              target="_blank"
              rel="noopener noreferrer"
              className="enter enter-4 hover-lift group mt-10 inline-flex items-center gap-2 w-fit bg-button-primary-bg text-button-primary-text border border-button-primary-bg rounded-full px-6 py-3 text-sm tracking-wide hover:bg-button-primary-hover hover:border-button-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
              Rugs priced $720–$86,000+ need to earn trust with no showroom
              and nothing to touch. At these prices, hesitation is the sale.
            </span>
          </p>
        </section>

        {/* THE SCREENS */}
        <section id="the-app" className="mx-auto px-6 md:px-10 py-[25px] max-w-5xl scroll-mt-28">
          <p className="text-lg leading-relaxed mb-16 max-w-[820px]">
            <span className="font-mono text-xs uppercase tracking-meta text-text-secondary mr-2">
              The App:
            </span>
            <span className="text-text-secondary">
              Discover, decide, buy — three stages, ten screens.
            </span>
          </p>

          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-8">
              <AnchorHeading id="discover" level={3}>Discover</AnchorHeading>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-12 justify-items-center">
                <Screenshot
                  src="/qalin/Home.webp"
                  label="Home"
                  width={633}
                  height={1280}
                  onOpen={setLightboxImage}
                  caption="Rug as hero image. One CTA."
                />
                <Screenshot
                  src="/qalin/2.webp"
                  label="New arrivals"
                  width={633}
                  height={1280}
                  onOpen={setLightboxImage}
                  caption="Category tabs sit directly under the hero."
                />
                <Screenshot
                  src="/qalin/4.webp"
                  label="Style filter menu"
                  width={633}
                  height={1280}
                  onOpen={setLightboxImage}
                  caption="Filters by design language, not spec."
                />
                <Screenshot
                  src="/qalin/9.webp"
                  label="Search results"
                  width={633}
                  height={1280}
                  onOpen={setLightboxImage}
                  caption="Live counts, inline sort and filter."
                />
                <Screenshot
                  src="/qalin/3.webp"
                  label="Contact & trust"
                  width={633}
                  height={1280}
                  onOpen={setLightboxImage}
                  caption="Store locator, one scroll down."
                />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <AnchorHeading id="decide" level={3}>Decide</AnchorHeading>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-12 justify-items-center">
                <Screenshot
                  src="/qalin/5.webp"
                  label="Full catalog grid"
                  width={633}
                  height={1280}
                  onOpen={setLightboxImage}
                  caption="Construction + price on every card."
                />
                <Screenshot
                  src="/qalin/6.webp"
                  label="Product detail"
                  width={633}
                  height={1280}
                  onOpen={setLightboxImage}
                  caption="Four-shot gallery. Exact sizing. One CTA."
                />
              </div>
            </div>

            <div className="flex flex-col gap-8">
              <AnchorHeading id="buy" level={3}>Buy</AnchorHeading>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-12 justify-items-center">
                <Screenshot
                  src="/qalin/7.webp"
                  label="Cart"
                  width={633}
                  height={1280}
                  onOpen={setLightboxImage}
                  caption="Plain subtotal. Tax resolves at checkout."
                />
                <Screenshot
                  src="/qalin/8.webp"
                  label="Checkout"
                  width={633}
                  height={1280}
                  onOpen={setLightboxImage}
                  caption="One screen. No steps, no upsells."
                />
                <Screenshot
                  src="/qalin/10.webp"
                  label="Payment success"
                  width={633}
                  height={1280}
                  onOpen={setLightboxImage}
                  caption="Payment ID, one-tap feedback, clear return path."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto px-6 md:px-10 py-[25px] max-w-5xl">
          <div className="max-w-[820px]">
            <MetadataFooter
              fields={[
                ["Last Updated", "Aug 2026"],
                ["Read Time", "1 min"],
                ["Word Count", "260"],
              ]}
            />
          </div>
        </section>
      </main>

      <footer>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-14 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-text-secondary/80 font-mono uppercase tracking-meta">
            Case study · Qalin · Marzia Saidi
          </p>
          <a
            href="#/"
            className="link-dotted text-sm text-text-secondary hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            Back to portfolio
          </a>
        </div>
      </footer>

      <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
    </div>
  );
}
