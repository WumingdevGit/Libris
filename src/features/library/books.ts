export type Book = {
  id: string; // books.id (uuid)
  title: string;
  author: string;
  genre: string;
  note: string;
  cover: string;
  tone: string;
};

export type BookRow = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  cover_url?: string | null;
  published_year?: number | null;
  authors?: string[] | null;
  subjects?: string[] | null;
};

export const BOOK_COLUMNS =
  "id, title, subtitle, description, cover_url, published_year, authors, subjects";

const TONES = ["olive", "rust", "blue", "gold", "plum", "sand"];

function toneFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

export function toBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.authors?.length ? row.authors.join(", ") : "Unknown author",
    genre: row.subjects?.[0] ?? "Book",
    note:
      row.description ??
      (row.published_year ? `First published ${row.published_year}` : ""),
    cover: row.cover_url ?? "",
    tone: toneFor(row.id),
  };
}