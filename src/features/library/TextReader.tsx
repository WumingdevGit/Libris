import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ChevronLeft, ChevronRight, Type } from "lucide-react";
import { supabase } from "../../services/supabase/client";
import { useAuth } from "../auth/AuthContext";
import Select from "../../components/Select";
import { useReadingProgress } from "./useReadingProgress";
import type { Book, Status } from "./books";

type TextBook = {
  title: string;
  chapters: { title: string; paragraphs: string[] }[];
};

type Prefs = {
  theme: "paper" | "sepia" | "dark";
  size: number;
  font: "serif" | "sans";
};

const PREFS_KEY = "libris:reader";
const DEFAULT_PREFS: Prefs = { theme: "paper", size: 19, font: "serif" };
const textCache = new Map<string, TextBook>();

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        theme: p.theme === "sepia" || p.theme === "dark" ? p.theme : "paper",
        size: Math.min(28, Math.max(15, Number(p.size) || DEFAULT_PREFS.size)),
        font: p.font === "sans" ? "sans" : "serif",
      };
    }
  } catch {
    // Storage can be unavailable; use the defaults
  }
  return DEFAULT_PREFS;
}

// Gutenberg marks italics with _underscores_
function Inline({ text }: { text: string }) {
  const parts = text.split(/(_[^_\n]+_)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.length > 2 && part.startsWith("_") && part.endsWith("_") ? (
          <em key={i}>{part.slice(1, -1)}</em>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

type Props = {
  book: Book;
  status?: Status;
  onSetStatus: (bookId: string, status: Status) => void;
};

export default function TextReader({ book, status, onSetStatus }: Props) {
  const { user } = useAuth();
  const progress = useReadingProgress(book.id, user?.id ?? null, !!status);
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [panel, setPanel] = useState(false);
  const [chapterPick, setChapterPick] = useState<number | null>(null);
  const [percent, setPercent] = useState(0);
  const [resumed, setResumed] = useState(false);
  const [fetched, setFetched] = useState<{
    id: string;
    data: TextBook | null;
    error: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const aaRef = useRef<HTMLDivElement>(null);
  const restored = useRef(false);
  const ticking = useRef(false);

  const cached = textCache.get(book.id) ?? null;
  const data = cached ?? (fetched?.id === book.id ? fetched.data : null);
  const loadError = !data && fetched?.id === book.id ? fetched.error : "";

  useEffect(() => {
    if (textCache.has(book.id)) return;
    let alive = true;

    (async () => {
      const { data: result, error } = await supabase.functions.invoke("gutenberg", {
        body: { action: "text", bookId: book.id },
      });
      if (!alive) return;

      if (error || !result?.chapters?.length) {
        setFetched({
          id: book.id,
          data: null,
          error: "This book's text couldn't be loaded right now. Please try again shortly.",
        });
        return;
      }
      textCache.set(book.id, result as TextBook);
      setFetched({ id: book.id, data: result as TextBook, error: "" });
    })();

    return () => {
      alive = false;
    };
  }, [book.id]);

  // Character count before each chapter, used to work out the percentage
  const stats = useMemo(() => {
    if (!data) return null;
    let total = 0;
    const starts = data.chapters.map((chapter) => {
      const start = total;
      total += chapter.paragraphs.reduce((n, p) => n + p.length, 0);
      return start;
    });
    return { starts, total: Math.max(total, 1) };
  }, [data]);

  const percentAt = useCallback(
    (c: number, p: number) => {
      if (!data || !stats) return 0;
      const chapter = data.chapters[c];
      if (!chapter) return 0;
      let before = 0;
      for (let i = 0; i < p && i < chapter.paragraphs.length; i++) {
        before += chapter.paragraphs[i].length;
      }
      return ((stats.starts[c] + before) / stats.total) * 100;
    },
    [data, stats],
  );

  const lastChapter = data ? data.chapters.length - 1 : 0;
  const chapterIndex = Math.min(
    lastChapter,
    Math.max(0, chapterPick ?? progress.locator?.c ?? 0),
  );

  // Return to the saved spot once the text and the saved position are both ready
  useEffect(() => {
    if (restored.current || !data || !progress.loaded) return;
    restored.current = true;
    const loc = progress.locator;
    if (!loc || (loc.c === 0 && loc.p === 0)) return;

    window.requestAnimationFrame(() => {
      if (loc.p > 0) {
        scrollRef.current
          ?.querySelector(`[data-p="${loc.p}"]`)
          ?.scrollIntoView({ block: "start" });
      }
      setPercent(Math.round(percentAt(loc.c, loc.p)));
      setResumed(true);
      window.setTimeout(() => setResumed(false), 4000);
    });
  }, [data, progress.loaded, progress.locator, percentAt]);

  // Close the settings panel when clicking elsewhere or pressing Escape
  useEffect(() => {
    if (!panel) return;
    const onDown = (event: MouseEvent) => {
      if (!aaRef.current?.contains(event.target as Node)) setPanel(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [panel]);

  function updatePrefs(next: Prefs) {
    setPrefs(next);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      // Not being able to remember the settings is fine
    }
  }

  function reportPosition(paragraph: number) {
    const pct = percentAt(chapterIndex, paragraph);
    setPercent(Math.round(pct));
    if (user) progress.save({ c: chapterIndex, p: paragraph }, pct);
  }

  function handleScroll() {
    if (ticking.current || !data) return;
    ticking.current = true;
    window.requestAnimationFrame(() => {
      ticking.current = false;
      const root = scrollRef.current;
      if (!root) return;
      const top = root.getBoundingClientRect().top + 24;
      let found = 0;
      for (const node of root.querySelectorAll<HTMLElement>("[data-p]")) {
        if (node.getBoundingClientRect().bottom > top) {
          found = Number(node.dataset.p);
          break;
        }
      }
      reportPosition(found);
    });
  }

  function goToChapter(next: number) {
    const target = Math.min(lastChapter, Math.max(0, next));
    const pct = percentAt(target, 0);
    setChapterPick(target);
    setPercent(Math.round(pct));
    scrollRef.current?.scrollTo({ top: 0 });
    if (user) progress.save({ c: target, p: 0 }, pct);
  }

  if (loadError) {
    return (
      <div className="text-reader-message">
        <h2>We couldn't open this book here</h2>
        <p>{loadError}</p>
      </div>
    );
  }

  if (!data || !progress.loaded) {
    return <div className="text-reader-message"><p>Opening the book…</p></div>;
  }

  const chapter = data.chapters[chapterIndex];

  return (
    <div
      className="text-reader"
      data-theme={prefs.theme}
      data-font={prefs.font}
      style={{ "--tr-size": `${prefs.size}px` } as CSSProperties}
    >
      <div className="text-toolbar">
        <Select
          label="Chapters"
          value={chapterIndex}
          options={data.chapters.map((c, i) => ({
            value: i,
            label: c.title.length > 60 ? `${c.title.slice(0, 57)}…` : c.title,
          }))}
          onChange={goToChapter}
        />

        <span className="tr-progress">
          Section {chapterIndex + 1} of {data.chapters.length} · {percent}%
        </span>

        <div className="tr-aa" ref={aaRef}>
          <button
            className="reader-btn"
            type="button"
            onClick={() => setPanel((open) => !open)}
            aria-expanded={panel}
            aria-label="Reading settings"
          >
            <Type size={14} /> Aa
          </button>

          {panel && (
            <div className="tr-panel" role="dialog" aria-label="Reading settings">
              <div className="tr-row">
                <span>Theme</span>
                <div className="tr-choices">
                  {(["paper", "sepia", "dark"] as const).map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      className={`tr-choice ${prefs.theme === theme ? "tr-choice-on" : ""}`}
                      onClick={() => updatePrefs({ ...prefs, theme })}
                    >
                      {theme[0].toUpperCase() + theme.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="tr-row">
                <span>Text size</span>
                <div className="tr-choices">
                  <button type="button" className="tr-choice" onClick={() => updatePrefs({ ...prefs, size: Math.max(15, prefs.size - 1) })} aria-label="Smaller text">A−</button>
                  <span className="tr-size">{prefs.size}</span>
                  <button type="button" className="tr-choice" onClick={() => updatePrefs({ ...prefs, size: Math.min(28, prefs.size + 1) })} aria-label="Larger text">A+</button>
                </div>
              </div>
              <div className="tr-row">
                <span>Typeface</span>
                <div className="tr-choices">
                  {(["serif", "sans"] as const).map((font) => (
                    <button
                      key={font}
                      type="button"
                      className={`tr-choice ${prefs.font === font ? "tr-choice-on" : ""}`}
                      onClick={() => updatePrefs({ ...prefs, font })}
                    >
                      {font === "serif" ? "Serif" : "Sans"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-scroll" ref={scrollRef} onScroll={handleScroll}>
        <article className="text-page">
          <h2 className="tr-chapter-title">{chapter.title}</h2>
          {chapter.paragraphs.map((p, i) => (
            <p
              key={`${chapterIndex}-${i}`}
              data-p={i}
              className={p.includes("\n") ? "tr-p tr-verse" : "tr-p"}
            >
              <Inline text={p} />
            </p>
          ))}

          <nav className="tr-nav" aria-label="Section navigation">
            <button
              type="button"
              className="reader-btn"
              onClick={() => goToChapter(chapterIndex - 1)}
              disabled={chapterIndex === 0}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            {chapterIndex < lastChapter ? (
              <button type="button" className="reader-btn" onClick={() => goToChapter(chapterIndex + 1)}>
                Next <ChevronRight size={14} />
              </button>
            ) : user && status !== "finished" ? (
              <button type="button" className="reader-btn" onClick={() => onSetStatus(book.id, "finished")}>
                Mark as finished
              </button>
            ) : (
              <span className="tr-end">The end</span>
            )}
          </nav>
        </article>
      </div>

      {resumed && <div className="tr-toast" role="status">Back where you left off</div>}
    </div>
  );
}