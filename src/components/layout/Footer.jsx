export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-accent text-background overflow-hidden">
      <img
        src="/illustrations/blue-mosque.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none select-none absolute right-[-4%] bottom-[-10%] w-[420px] max-w-[70%] opacity-[0.12] mix-blend-luminosity"
      />
      <img
        src="/illustrations/snow-leopard.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none select-none absolute left-2 sm:left-6 md:left-10 top-0 bottom-0 my-auto h-[88%] w-auto max-w-[40%] object-contain opacity-95"
      />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10 py-20 flex flex-col items-center text-center gap-8">
        <blockquote className="font-serif italic text-2xl md:text-3xl max-w-xl leading-snug text-background/90">
          "The beauty of a thing lies in its purpose and its craft."
        </blockquote>
        <span className="block w-16 h-px bg-gold" />

        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm text-background/70">
          <p>&copy; {year} Marzia Saidi</p>
          <div className="flex items-center gap-6">
            <a
              href="https://www.linkedin.com/in/marzia-saidisoftwareengineer/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
            >
              LinkedIn
            </a>
            <a
              href="mailto:marzia.saidi67@gmail.com"
              className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm"
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
