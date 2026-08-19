export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-16 pb-10 flex flex-col items-center text-center gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-text-secondary">
          <p>&copy; {year} Marzia Saidi</p>
          <div className="flex items-center gap-6">
            <a
              href="https://www.linkedin.com/in/marzia-saidisoftwareengineer/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
            >
              LinkedIn
            </a>
            <a
              href="mailto:marzia.saidi67@gmail.com"
              className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
            >
              Email
            </a>
          </div>
        </div>
      </div>

      {/* Full-bleed signature. SVG textLength forces the wordmark to reach
          exact edge-to-edge width at any viewport size — a vw-based
          font-size can only approximate that. Doubles as a "back to top"
          link; the outline crossfades to the accent/gold gradient on
          hover so the two accent colors get one shared, celebratory use. */}
      <a
        href="#top"
        aria-label="Back to top"
        className="group block w-full pb-6 md:pb-10 focus-visible:outline-none"
      >
        <svg
          viewBox="0 0 1000 200"
          className="w-full h-auto block focus-visible:ring-2 focus-visible:ring-bronze focus-visible:ring-offset-4 focus-visible:ring-offset-background rounded-md"
          role="presentation"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="footerMarkFill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--color-accent)" />
              <stop offset="100%" stopColor="var(--color-gold)" />
            </linearGradient>
          </defs>
          <text
            x="500"
            y="52%"
            textAnchor="middle"
            dominantBaseline="central"
            textLength="980"
            lengthAdjust="spacingAndGlyphs"
            fontSize="170"
            fill="none"
            stroke="var(--color-text-secondary)"
            strokeOpacity="0.55"
            strokeWidth="1.25"
            className="font-display font-semibold transition-opacity duration-500 group-hover:opacity-0"
          >
            Marzia Saidi
          </text>
          <text
            x="500"
            y="52%"
            textAnchor="middle"
            dominantBaseline="central"
            textLength="980"
            lengthAdjust="spacingAndGlyphs"
            fontSize="170"
            fill="url(#footerMarkFill)"
            className="font-display font-semibold opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          >
            Marzia Saidi
          </text>
        </svg>
      </a>
    </footer>
  );
}
