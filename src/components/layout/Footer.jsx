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
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-10 pb-4 flex justify-center">
        <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-text-secondary">
          Marzia.OS &middot; Status: open to work &middot; Local time {time}
        </p>
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
