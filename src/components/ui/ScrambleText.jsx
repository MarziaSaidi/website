import { useEffect, useRef, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#01";

/*
 * Kinetic headline: sweeps left-to-right, cycling each character through
 * random glyphs before it locks to the real letter — a decode-in effect
 * rather than a static fade. The real text is always in the DOM (via
 * aria-label on the wrapper + a visually-hidden node) so screen readers
 * never see the scrambled interim state.
 */
export default function ScrambleText({
  text,
  as: Tag = "span",
  className = "",
  delay = 0,
  charDelay = 28,
  scrambleTicks = 7,
}) {
  const [display, setDisplay] = useState(text);
  const frameRef = useRef(0);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(text);
      return;
    }

    const chars = text.split("");
    const revealed = new Array(chars.length).fill(false);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    function renderFrame() {
      setDisplay(
        chars
          .map((c, i) => {
            if (c === " ") return " ";
            if (revealed[i]) return chars[i];
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("")
      );
    }

    function scheduleReveal(i) {
      const t = setTimeout(() => {
        let ticks = 0;
        const interval = setInterval(() => {
          renderFrame();
          ticks += 1;
          if (ticks >= scrambleTicks) {
            clearInterval(interval);
            revealed[i] = true;
            renderFrame();
          }
        }, 22);
        timeoutsRef.current.push(interval);
      }, delay + i * charDelay);
      timeoutsRef.current.push(t);
    }

    chars.forEach((c, i) => {
      if (c !== " ") scheduleReveal(i);
    });

    return () => {
      timeoutsRef.current.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      cancelAnimationFrame(frameRef.current);
    };
  }, [text, delay, charDelay, scrambleTicks]);

  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden="true">{display}</span>
    </Tag>
  );
}
