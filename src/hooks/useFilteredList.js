import { useLayoutEffect, useRef, useState } from "react";

const ENTER_MS = 480;
const LEAVE_MS = 340;

/*
 * Drives a filterable grid without a library: items that stay visible
 * across a filter change reposition with a FLIP transform (measured before
 * the DOM updates, animated after); items leaving fade+scale out and are
 * only removed once that transition finishes; items entering fade+scale in.
 * Respects prefers-reduced-motion by skipping straight to the end state.
 */
export function useFilteredList(items, active, matches, key = (item) => item.id) {
  const [renderItems, setRenderItems] = useState(() => items.filter((i) => matches(i, active)));
  const phaseRef = useRef(new Map());
  const nodeRefs = useRef(new Map());
  const rectsRef = useRef(new Map());
  const timeoutsRef = useRef(new Map());
  const reduceRef = useRef(false);

  useLayoutEffect(() => {
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useLayoutEffect(() => {
    const matched = items.filter((i) => matches(i, active));
    const matchedIds = new Set(matched.map(key));
    const currentIds = new Set(renderItems.map(key));

    nodeRefs.current.forEach((node, id) => {
      if (node) rectsRef.current.set(id, node.getBoundingClientRect());
    });

    const entering = matched.filter((i) => !currentIds.has(key(i)));
    const leavingIds = [...currentIds].filter((id) => !matchedIds.has(id));
    if (entering.length === 0 && leavingIds.length === 0) return;

    const next = [...matched];
    leavingIds.forEach((id) => {
      const original = items.find((i) => key(i) === id);
      if (original) next.push(original);
    });

    entering.forEach((i) => {
      phaseRef.current.set(key(i), "entering");
      const t = timeoutsRef.current.get(key(i));
      if (t) {
        clearTimeout(t);
        timeoutsRef.current.delete(key(i));
      }
    });
    leavingIds.forEach((id) => phaseRef.current.set(id, "leaving"));

    setRenderItems(next);

    leavingIds.forEach((id) => {
      const t = setTimeout(() => {
        setRenderItems((prev) => prev.filter((i) => key(i) !== id));
        phaseRef.current.delete(id);
        timeoutsRef.current.delete(id);
      }, LEAVE_MS);
      timeoutsRef.current.set(id, t);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useLayoutEffect(() => {
    renderItems.forEach((item) => {
      const id = key(item);
      const node = nodeRefs.current.get(id);
      if (!node) return;
      const phase = phaseRef.current.get(id) || "visible";

      if (reduceRef.current) {
        node.style.transition = "none";
        node.style.opacity = phase === "leaving" ? "0" : "1";
        node.style.transform = "";
        node.style.pointerEvents = phase === "leaving" ? "none" : "";
        return;
      }

      if (phase === "entering") {
        node.style.transition = "none";
        node.style.opacity = "0";
        node.style.transform = "scale(0.96) translateY(8px)";
        requestAnimationFrame(() => {
          node.style.transition = `opacity ${ENTER_MS}ms cubic-bezier(0.16,1,0.3,1), transform ${ENTER_MS}ms cubic-bezier(0.16,1,0.3,1)`;
          node.style.opacity = "1";
          node.style.transform = "";
          phaseRef.current.set(id, "visible");
        });
        return;
      }

      if (phase === "leaving") {
        node.style.transition = `opacity ${LEAVE_MS}ms ease, transform ${LEAVE_MS}ms ease`;
        node.style.opacity = "0";
        node.style.transform = "scale(0.96)";
        node.style.pointerEvents = "none";
        return;
      }

      const prevRect = rectsRef.current.get(id);
      if (prevRect) {
        const newRect = node.getBoundingClientRect();
        const dx = prevRect.left - newRect.left;
        const dy = prevRect.top - newRect.top;
        if (dx || dy) {
          node.style.transition = "none";
          node.style.transform = `translate(${dx}px, ${dy}px)`;
          requestAnimationFrame(() => {
            node.style.transition = "transform 0.45s cubic-bezier(0.16,1,0.3,1)";
            node.style.transform = "";
          });
        }
      }
    });
  });

  const refFor = (id) => (node) => {
    if (node) nodeRefs.current.set(id, node);
    else nodeRefs.current.delete(id);
  };

  return { renderItems, refFor };
}
