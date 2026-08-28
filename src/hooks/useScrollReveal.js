import { useEffect, useRef } from "react";

// Options are destructured to primitives rather than kept as an object,
// because the previous `options = {}` default allocated a fresh object on
// every render and sat in the dependency array — so the effect tore down and
// rebuilt the IntersectionObserver on every single re-render of every
// revealing component, instead of once on mount.
export function useScrollReveal({
  threshold = 0.15,
  rootMargin = "0px 0px -60px 0px",
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
