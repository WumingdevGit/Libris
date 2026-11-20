import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Type } from "lucide-react";
import { supabase } from "../../services/supabase/client";
import { useAuth } from "../auth/AuthContext";
import Select from "../../components/Select";
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
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);
  const [panel, setPanel] = useState(false);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [fetched, setFetched] = useState<{
    id: string;
    data: TextBook | null;
    error: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const aaRef = useRef<HTMLDivElement>(null);

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

  if (loadError) {
    return (
      <div className="text-reader-message">
        <h2>We couldn't open this book here</h2>
        <p>{loadError}</p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-reader-message"><p>Opening the book…</p></div>;
  }

  const lastChapter = data.chapters.length - 1;
  const index = Math.min(chapterIndex, lastChapter);
  const chapter = data.chapters[index];

  function goToChapter(next: number) {
    setChapterIndex(Math.min(lastChapter, Math.max(0, next)));
    scrollRef.current?.scrollTo({ top: 0 });
  }

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
          value={index}
          options={data.chapters.map((c, i) => ({
            value: i,
            label: c.title.length > 60 ? `${c.title.slice(0, 57)}…` : c.title,
          }))}
          onChange={goToChapter}
        />

        <span className="tr-progress">
          Section {index + 1} of {data.chapters.length}
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

      <div className="text-scroll" ref={scrollRef}>
        <article className="text-page">
          <h2 className="tr-chapter-title">{chapter.title}</h2>
          {chapter.paragraphs.map((p, i) => (
            <p
              key={`${index}-${i}`}
              className={p.includes("\n") ? "tr-p tr-verse" : "tr-p"}
            >
              <Inline text={p} />
            </p>
          ))}

          <nav className="tr-nav" aria-label="Section navigation">
            <button
              type="button"
              className="reader-btn"
              onClick={() => goToChapter(index - 1)}
              disabled={index === 0}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            {index < lastChapter ? (
              <button type="button" className="reader-btn" onClick={() => goToChapter(index + 1)}>
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
    </div>
  );
}