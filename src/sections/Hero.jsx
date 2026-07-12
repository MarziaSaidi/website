import Button from "../components/ui/Button";
import { useScrollReveal } from "../hooks/useScrollReveal";

export default function Hero() {
  const textRef = useScrollReveal();
  const imgRef = useScrollReveal();

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
        <div ref={textRef} className="reveal flex flex-col gap-6">
          <h1 className="text-6xl md:text-7xl leading-[1.05] text-text">
            Marzia Saidi
          </h1>
          <p className="font-serif text-2xl text-gold">Software Engineer</p>
          <p className="text-text-secondary leading-relaxed max-w-md">
            I like building things that make people's lives a little easier.
            Whether it's a full-stack application or improving a small
            interaction, I care about the details that turn software into a
            better experience.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button href="#chore-board" variant="primary">
              Explore My Work
            </Button>
            <Button href="#contact" variant="secondary">
              Get in Touch
            </Button>
          </div>
        </div>

        <div ref={imgRef} className="reveal">
          <img
            src="/illustrations/blue-mosque.png"
            alt="Hand-drawn pencil illustration of a Timurid-era blue-domed mosque"
            className="w-full h-auto"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
