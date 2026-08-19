import { useEffect, useRef } from "react";
import { useScrollY } from "../../hooks/useScrollY";

export default function ScrollProgress() {
  const ref = useRef(null);
  const scrollY = useScrollY();

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      bar.style.setProperty("--scroll-progress", String(progress));
    };

    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, [scrollY]);

  return <div ref={ref} className="scroll-progress" aria-hidden="true" />;
}
