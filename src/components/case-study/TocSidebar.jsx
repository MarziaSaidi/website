import { useActiveSection } from "../../hooks/useActiveSection";
import { scrollToSection } from "../../lib/scrollToSection";

// Fixed left rail mirroring aDrive's own in-page nav: every section (and
// nested sub-section) gets a link, indented by level, with the currently-
// read section highlighted via IntersectionObserver rather than a plain
// scroll-offset guess. Desktop only (xl+) — there isn't room for a 240px
// rail next to an 820px reading column below that.
export default function TocSidebar({ sections }) {
  const ids = sections.flatMap((s) => [s.id, ...(s.children || []).map((c) => c.id)]);
  const activeId = useActiveSection(ids);

  return (
    <nav
      aria-label="Section navigation"
      className="hidden xl:block fixed top-1/2 -translate-y-1/2 left-8 2xl:left-16 w-56 z-30"
    >
      <ol className="flex flex-col gap-2 text-sm border-l border-border pl-5">
        {sections.map((s) => (
          <li key={s.id} className="flex flex-col gap-2">
            <a
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(s.id);
              }}
              className={`transition-colors truncate ${
                activeId === s.id ? "text-text" : "text-text-secondary/60 hover:text-text-secondary"
              }`}
            >
              {s.label}
            </a>
            {s.children?.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(c.id);
                }}
                className={`pl-4 text-xs transition-colors truncate ${
                  activeId === c.id ? "text-text" : "text-text-secondary/40 hover:text-text-secondary"
                }`}
              >
                {c.label}
              </a>
            ))}
          </li>
        ))}
      </ol>
    </nav>
  );
}
