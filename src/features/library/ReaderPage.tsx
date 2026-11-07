import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, ExternalLink, Maximize2, Minimize2 } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { supabase } from "../../services/supabase/client";
import {
  BOOK_COLUMNS,
  STATUSES,
  STATUS_LABELS,
  toBook,
  type Book,
  type BookRow,
  type Status,
} from "./books";

type Props = {
  statuses: Record<string, Status>;
  shelfLoading: boolean;
  onStartReading: (book: Book) => void;
  onSetStatus: (bookId: string, status: Status) => void;
};

// Internet Archive ids only use these characters; anything else is not embedded
const SAFE_ID = /^[A-Za-z0-9._-]+$/;

export default function ReaderPage({
  statuses,
  shelfLoading,
  onStartReading,
  onSetStatus,
}: Props) {
  const { id } = useParams();
  const { user } = useAuth();
  const [result, setResult] = useState<{ id: string; row: BookRow | null } | null>(null);
  const [isFull, setIsFull] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const startedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;

    (async () => {
      const { data, error } = await supabase
        .from("books")
        .select(BOOK_COLUMNS)
        .eq("id", id)
        .maybeSingle();
      if (!alive) return;
      setResult({ id, row: error ? null : ((data as BookRow | null) ?? null) });
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    const onChange = () => setIsFull(document.fullscreenElement === shellRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const loading = !!id && result?.id !== id;
  const row = loading ? null : (result?.row ?? null);
  const book = row ? toBook(row) : null;
  const iaId = row?.ia_id && SAFE_ID.test(row.ia_id) ? row.ia_id : null;
  const canRead = !!book && book.access === "public" && !!iaId;

  // Opening the reader counts as starting to read (signed-in users only)
  useEffect(() => {
    if (!canRead || !book || !user || shelfLoading) return;
    if (startedFor.current === book.id) return;
    startedFor.current = book.id;
    onStartReading(book);
  }, [canRead, book, user, shelfLoading, onStartReading]);

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void shellRef.current?.requestFullscreen?.();
  }

  if (loading) {
    return (
      <div className="reader-shell">
        <div className="reader-bar"><span>Opening book…</span></div>
      </div>
    );
  }

  if (!book || !canRead || !iaId) {
    return (
      <main className="page-gutter book-page">
        <Link className="book-back" to={book ? `/book/${book.id}` : "/discover"}>
          <ArrowLeft size={15} /> Back
        </Link>
        <h1>This book can't be opened in the LIBRIS reader</h1>
        <p>
          Only books that are openly available can be read here. You can check
          whether it can be read or borrowed on Open Library instead.
        </p>
        {book && (
          <p>
            <Link className="button-secondary" to={`/book/${book.id}`}>View book details</Link>
          </p>
        )}
      </main>
    );
  }

  const status = statuses[book.id];

  return (
    <div className="reader-shell" ref={shellRef}>
      <div className="reader-bar">
        <Link className="reader-back" to={`/book/${book.id}`}>
          <ArrowLeft size={15} /> Book details
        </Link>

        <div className="reader-title">
          <strong>{book.title}</strong>
          <span>{book.author}</span>
        </div>

        <div className="reader-tools">
          {user && status && (
            <select
              className="status-select"
              value={status}
              onChange={(e) => onSetStatus(book.id, e.target.value as Status)}
              aria-label="Reading status"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          )}
          {user && status && status !== "finished" && (
            <button className="reader-btn" type="button" onClick={() => onSetStatus(book.id, "finished")}>
              <Check size={14} /> Mark finished
            </button>
          )}
          <button className="reader-btn" type="button" onClick={toggleFullscreen}>
            {isFull ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {isFull ? " Exit fullscreen" : " Fullscreen"}
          </button>
          <a
            className="reader-btn"
            href={`https://archive.org/details/${iaId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Internet Archive <ExternalLink size={13} />
          </a>
        </div>
      </div>

      <iframe
        className="reader-frame"
        title={`Reading ${book.title}`}
        src={`https://archive.org/embed/${iaId}`}
        allow="fullscreen"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms"
      />

      <p className="reader-note">
        Book viewer provided by the Internet Archive.{" "}
        {!user && (
          <Link to="/auth" state={{ from: `/read/${book.id}` }}>
            Sign in to track your reading.
          </Link>
        )}
      </p>
    </div>
  );
}