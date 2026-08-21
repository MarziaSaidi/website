import { useEffect, useState } from "react";
import FooterSignature from "../FooterSignature";
import Magnetic from "../ui/Magnetic";

function useLocalTime() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }, 30000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export default function Footer() {
  const year = new Date().getFullYear();
  const time = useLocalTime();

  return (
    <footer className="relative border-t border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-10 pb-4 flex flex-wrap items-center justify-center sm:justify-between gap-3 sm:gap-4">
        <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-secondary">
          Marzia.OS &middot; Status: open to work &middot; Local time {time}
        </p>
        {/* A footer-level way back to the top of long pages (Home, Work)
            without hunting for the nav's own scroll-to-top button — sized
            to actually be noticed, but no button chrome — just text and
            an icon that shift to the accent color on hover. */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="shrink-0 group inline-flex items-center gap-2 font-mono text-sm tracking-[0.2em] uppercase text-text hover:text-accent transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
        >
          Top
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-6 pb-10 flex flex-col items-center text-center gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-text-secondary">
          <p>&copy; {year} Marzia Saidi</p>
          <div className="flex items-center gap-6">
            <Magnetic strength={0.25} max={8}>
              <a
                href="https://www.linkedin.com/in/marzia-saidisoftwareengineer/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
              >
                LinkedIn
              </a>
            </Magnetic>
            <Magnetic strength={0.25} max={8}>
              <a
                href="mailto:marzia.saidi67@gmail.com"
                className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze rounded-sm"
              >
                Email
              </a>
            </Magnetic>
          </div>
        </div>
      </div>

      <FooterSignature />
    </footer>
  );
}
