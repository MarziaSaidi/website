import { useMemo, useRef } from "react";
import { useHeroScrollProgress } from "../../hooks/useHeroProgress";
import { STAGES } from "./heroStoryboard.data";

// The compact "where am I" list beside the storyboard art — Lance's
// pattern: a glanceable list of stage names on the left, one focused
// card of detail for whichever stage is active, rather than every
// stage's full write-up sitting on the page at once. Subscribes to the
// same wrapper/progress the art panel does, independently (a second,
// cheap listener on the shared scroll subscription) rather than
// threading refs across two visually-separate parts of the layout.
export default function HeroStoryNav({ wrapperRef, reduced }) {
  const navRefs = useRef([]);
  const cardRefs = useRef([]);
  const activeIndexRef = useRef(reduced ? STAGES.length - 1 : 0);

  const applyProgress = useMemo(
    () => (progress) => {
      let activeIndex = STAGES.length - 1;
      for (let i = 0; i < STAGES.length; i++) {
        const s = STAGES[i];
        if (progress >= s.from && (progress < s.to || i === STAGES.length - 1)) {
          activeIndex = i;
          break;
        }
      }
      if (activeIndex === activeIndexRef.current) return;
      activeIndexRef.current = activeIndex;

      navRefs.current.forEach((el, i) => el?.classList.toggle("is-active", i === activeIndex));
      cardRefs.current.forEach((el, i) => el?.classList.toggle("is-active", i === activeIndex));
    },
    []
  );

  useHeroScrollProgress(wrapperRef, applyProgress, { disabled: reduced });

  // Reduced motion never runs applyProgress (the hook's listener is
  // disabled), so the JSX-authored default has to already match
  // HeroStoryboard's own reduced-motion state — the finished SHIP frame,
  // not DISCOVER — or the nav/card and the art would show two different
  // stages side by side with no scroll interaction to explain why.
  const defaultActive = reduced ? STAGES.length - 1 : 0;

  function jumpTo(stage) {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const mid = (stage.from + stage.to) / 2;
    const total = wrapper.offsetHeight - window.innerHeight;
    const stageTop = wrapper.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: stageTop + mid * total, behavior: "smooth" });
  }

  return (
    <div className="story-row flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-7">
      {/* Below sm, a narrow phone doesn't have room for the nav rail
          beside the card without cramping both — the list goes
          horizontal (wraps if needed) above a full-width card instead. */}
      <nav
        className="stage-nav flex flex-row flex-wrap gap-x-5 gap-y-2 sm:flex-col sm:flex-nowrap sm:gap-[1.1rem] sm:pt-1"
        aria-label="Storyboard stages"
      >
        {STAGES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            ref={(el) => (navRefs.current[i] = el)}
            onClick={() => jumpTo(s)}
            className={`nav-item relative flex items-baseline gap-[0.55rem] font-serif text-base text-text-secondary opacity-[0.42] transition-[opacity,padding-left,color] duration-300 pl-0 ${
              i === defaultActive ? "is-active" : ""
            }`}
          >
            <span className="nav-num font-mono text-[0.62rem] tracking-[0.05em]">{s.number}</span>
            {s.label}
          </button>
        ))}
      </nav>

      <div className="stage-card relative w-full sm:flex-1 sm:min-w-0 min-h-[10.5rem] border border-border px-7 py-6">
        {STAGES.map((s, i) => (
          <div key={s.key} ref={(el) => (cardRefs.current[i] = el)} className={`card-panel ${i === defaultActive ? "is-active" : ""}`}>
            <h2 className="font-serif text-2xl md:text-[1.7rem] font-semibold tracking-[-0.01em] text-text">{s.label}</h2>
            <p className="mt-[0.6rem] text-[0.96rem] leading-relaxed text-text-secondary max-w-[36ch]">{s.description}</p>
            <div className="mt-[0.9rem] flex flex-wrap gap-[0.4rem]">
              {s.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[0.63rem] tracking-[0.1em] uppercase px-[0.55rem] py-[0.28rem] border border-border rounded-full text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
