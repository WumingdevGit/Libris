export const STATUSES = [
  "want_to_read",
  "currently_reading",
  "finished",
  "paused",
] as const;

export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  want_to_read: "Want to read",
  currently_reading: "Reading now",
  finished: "Finished",
  paused: "Paused",
};

export type Access = "public" | "borrowable" | "restricted" | "none";
export type ReaderKind = "archive" | "text" | null;

export type Book = {
  id: string; // books.id (uuid)
  title: string;
  author: string;
  genre: string;
  note: string;
  cover: string;
  tone: string;
  access: Access;
  reader: ReaderKind; // which reader can open it
  readable: boolean; // free to read inside LIBRIS
};

export type BookRow = {
  id: string;
  title: string;
  provider?: string | null;
  subtitle?: string | null;
  description?: string | null;
  cover_url?: string | null;
  published_year?: number | null;
  authors?: string[] | null;
  subjects?: string[] | null;
  access?: string | null;
  ia_id?: string | null;
};

export const BOOK_COLUMNS =
  "id, title, provider, subtitle, description, cover_url, published_year, authors, subjects, access, ia_id";

const TONES = ["olive", "rust", "blue", "gold", "plum", "sand"];

function toneFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

function normaliseAccess(value: string | null | undefined): Access {
  return value === "public" || value === "borrowable" || value === "restricted"
    ? value
    : "none";
}

// Sources often list the same author under several spellings
function formatAuthors(authors?: string[] | null): string {
  if (!authors?.length) return "Unknown author";
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const name of authors) {
    const key = name.toLowerCase().replace(/[^a-z]/g, "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(name);
  }
  if (!unique.length) return "Unknown author";
  const shown = unique.slice(0, 2).join(", ");
  return unique.length > 2 ? `${shown} +${unique.length - 2} more` : shown;
}

export function toBook(row: BookRow): Book {
  const access = normaliseAccess(row.access);
  const reader: ReaderKind =
    access !== "public"
      ? null
      : row.provider === "gutenberg"
        ? "text"
        : row.ia_id
          ? "archive"
          : null;

  return {
    id: row.id,
    title: row.title,
    author: formatAuthors(row.authors),
    genre: row.subjects?.[0] ?? "Book",
    note:
      row.description ??
      (row.published_year ? `First published ${row.published_year}` : ""),
    cover: row.cover_url ?? "",
    tone: toneFor(row.id),
    access,
    reader,
    readable: reader !== null,
  };
}