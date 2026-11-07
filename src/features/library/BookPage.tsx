import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bookmark, BookOpen, ExternalLink, Heart } from "lucide-react";
import { supabase } from "../../services/supabase/client";
import Cover from "./Cover";
import {
  BOOK_COLUMNS,
  STATUSES,
  STATUS_LABELS,
  toBook,
  type Book,
  type BookRow,
  type Status,
} from "./books";

type Detail = BookRow & {
  provider: string | null;
  provider_book_id: string | null;
};

type Props = {
  savedIds: string[];
  statuses: Record<string, Status>;
  onToggleSave: (book: Book) => void;
  onSetStatus: (bookId: string, status: Status) => void;
};

export default function BookPage({
  savedIds,
  statuses,
  onToggleSave,
  onSetStatus,
}: Props) {
  const { id } = useParams();
  const [result, setResult] = useState<{ id: string; row: Detail | null } | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;

    (async () => {
      const { data, error } = await supabase
        .from("books")
        .select(`${BOOK_COLUMNS}, provider, provider_book_id`)
        .eq("id", id)
        .maybeSingle();
      if (!alive) return;
      setResult({ id, row: error ? null : ((data as Detail | null) ?? null) });
    })();

    return () => {
      alive = false;
    };
  }, [id]);

  const loading = !!id && result?.id !== id;

  if (loading) {
    return (
      <main className="page-gutter book-page">
        <p>Loading book…</p>
      </main>
    );
  }

  const row = result?.row;
  if (!row) {
    return (
      <main className="page-gutter book-page">
        <Link className="book-back" to="/discover">
          <ArrowLeft size={15} /> Back to Discover
        </Link>
        <h1>We couldn't find that book</h1>
        <p>It may have been removed, or the link is incorrect.</p>
      </main>
    );
  }

  const book = toBook(row);
  const saved = savedIds.includes(row.id);
  const status = statuses[row.id];
  const authors = row.authors?.length ? row.authors.join(", ") : "Unknown author";
  const openLibraryUrl =
    row.provider === "openlibrary" && row.provider_book_id
      ? `https://openlibrary.org/works/${row.provider_book_id}`
      : `https://openlibrary.org/search?q=${encodeURIComponent(`${row.title} ${authors}`)}`;

  return (
    <main className="page-gutter book-page">
      <Link className="book-back" to="/discover">
        <ArrowLeft size={15} /> Back to Discover
      </Link>

      <div className="book-detail">
        <div className={`book-cover-wrap cover-${book.tone}`}>
          <Cover src={book.cover} title={book.title} />
        </div>

        <div className="book-detail-copy">
          <p className="eyebrow">{book.genre.toUpperCase()}</p>
          <h1>{row.title}</h1>
          {row.subtitle && <p className="book-detail-subtitle">{row.subtitle}</p>}
          <p className="book-detail-author">
            {authors}
            {row.published_year ? ` · First published ${row.published_year}` : ""}
          </p>

          <p className={`access-note ${book.readable ? "access-note-free" : ""}`}>
            {book.readable
              ? "Free to read: open access"
              : book.access === "public"
                ? "Free online on Open Library"
                : book.access === "borrowable"
                  ? "Can be borrowed on Open Library"
                  : book.access === "restricted"
                    ? "Restricted access on Open Library"
                    : "Check Open Library for availability"}
          </p>

          {row.description && <p className="book-detail-description">{row.description}</p>}

          {!!row.subjects?.length && (
            <div className="book-detail-subjects">
              {row.subjects.map((s) => (
                <span key={s} className="genre-chip">{s}</span>
              ))}
            </div>
          )}

          <div className="book-detail-actions">
            {book.readable && (
              <Link className="button-primary" to={`/read/${row.id}`}>
                <BookOpen size={15} /> Read in LIBRIS
              </Link>
            )}

            {saved && status ? (
              <label className="book-status-field">
                Reading status
                <select
                  className="status-select"
                  value={status}
                  onChange={(e) => onSetStatus(row.id, e.target.value as Status)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </label>
            ) : null}

            <button
              className="button-secondary"
              type="button"
              onClick={() => onToggleSave(book)}
            >
              {saved ? <Heart size={16} fill="currentColor" /> : <Bookmark size={16} />}
              {saved ? " Remove from my shelf" : " Save to my shelf"}
            </button>

            <a
              className={book.readable ? "button-secondary" : "button-primary"}
              href={openLibraryUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Open Library <ExternalLink size={15} />
            </a>
          </div>

          <p className="book-detail-note">
            Whether a book can be read or borrowed in full depends on Open Library and its lending partners.
          </p>
        </div>
      </div>
    </main>
  );
}