import Button from "../components/ui/Button";

export default function Hero() {
  return (
    <section
      id="top"
      aria-label="Introduction"
      className="relative pt-40 pb-16 md:pt-48 md:pb-24 overflow-hidden"
    >
      <img
        src="/illustrations/tile.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none select-none absolute -top-10 -left-10 w-64 md:w-80 h-auto opacity-80"
        style={{
          maskImage:
            "radial-gradient(circle at top left, black 45%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(circle at top left, black 45%, transparent 75%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col gap-6">
          <h1 className="enter enter-1 text-6xl md:text-7xl leading-[1.05] text-text">
            Marzia Saidi
          </h1>
          <p className="enter enter-2 font-serif text-2xl text-gold">
            Software Engineer building products from idea to production.
          </p>
          <p className="enter enter-3 text-text-secondary leading-relaxed max-w-md">
            I build full-stack applications that solve real problems, from
            designing database systems and backend workflows to creating
            interfaces that make software easier to use. I’ve worked with
            startups to ship production features across web and mobile,
            combining engineering skills with product thinking to build
            software people actually need.
          </p>
          <div className="enter enter-4 flex flex-wrap items-center gap-4 pt-2">
            <Button href="#chore-board" variant="primary">
              Explore My Work
            </Button>
            <Button href="#contact" variant="secondary">
              Get in Touch
            </Button>
          </div>
        </div>

        <div className="enter enter-3 illustration-hover">
          <img
            src="/illustrations/blue-mosque.png"
            alt="Hand-drawn pencil illustration of a Timurid-era blue-domed mosque"
            className="w-full h-auto opacity-40"
            draggable={false}
          />
        </div>
      </div>

      <a
        href="#about"
        aria-label="Scroll to explore"
        className="enter enter-5 hidden md:flex flex-col items-center gap-2 absolute bottom-8 left-1/2 -translate-x-1/2 text-text-secondary hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
      >
        <span className="text-[0.65rem] tracking-[0.25em] uppercase">Scroll</span>
        <span
          className="scroll-cue-dot"
          aria-hidden="true"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </span>
      </a>
    </section>
  );
}
