import { useEffect } from "react";

const DEFAULT_TITLE = document.title;
const DEFAULT_DESCRIPTION =
  document.querySelector('meta[name="description"]')?.getAttribute("content") || "";

// Every hash route shares index.html's one <title>/<meta description> (the
// homepage's) unless a page opts in here — a case study otherwise never gets
// its own browser-tab title or gets a generic description if bookmarked.
// Restores the site-wide default on unmount so leaving the page doesn't
// leave a stale case-study title behind on Home.
//
// This does NOT make case studies independently indexable by search
// engines or give them their own link-preview card — those read the
// server-delivered HTML before this effect ever runs. That needs the
// routes to be real paths with prerendering/SSR, a separate, bigger change.
export function useDocumentMeta(title, description) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    if (title) document.title = title;
    if (description && meta) meta.setAttribute("content", description);

    return () => {
      document.title = DEFAULT_TITLE;
      if (meta) meta.setAttribute("content", DEFAULT_DESCRIPTION);
    };
  }, [title, description]);
}
