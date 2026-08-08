import { useEffect, useState } from "react";

// Minimal hash-based routing for this SPA (no router dependency).
// Route hashes use a "#/" prefix (e.g. "#/survue") so they don’t collide
// with in-page anchor links like "#about" or "#contact".
export function useHashRoute() {
  const [hash, setHash] = useState(() =>
    typeof window === "undefined" ? "" : window.location.hash
  );

  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return hash;
}
