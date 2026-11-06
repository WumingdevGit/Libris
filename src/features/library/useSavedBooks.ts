import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase/client";
import { useAuth } from "../auth/AuthContext";
import {
  BOOK_COLUMNS,
  toBook,
  type Book,
  type BookRow,
  type Status,
} from "./books";

type SavedRow = { status: Status; books: BookRow | BookRow[] | null };
type Shelf = {
  userId: string | null;
  books: Book[];
  statuses: Record<string, Status>;
};

export function useSavedBooks() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [shelf, setShelf] = useState<Shelf>({
    userId: null,
    books: [],
    statuses: {},
  });
  const [error, setError] = useState("");

  const loaded = !!userId && shelf.userId === userId;
  const savedBooks = loaded ? shelf.books : [];
  const statuses: Record<string, Status> = loaded ? shelf.statuses : {};
  const savedIds = savedBooks.map((b) => b.id);
  const loading = !!userId && !loaded;

  useEffect(() => {
    if (!userId) return;
    let alive = true;

    (async () => {
      const { data, error: dbError } = await supabase
        .from("user_books")
        .select(`status, created_at, books(${BOOK_COLUMNS})`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!alive) return;

      if (dbError) {
        setError("Couldn't load your shelf. Please refresh.");
        setShelf({ userId, books: [], statuses: {} });
        return;
      }

      const rows = (data ?? []) as unknown as SavedRow[];
      const books: Book[] = [];
      const nextStatuses: Record<string, Status> = {};
      for (const row of rows) {
        const bookRow = Array.isArray(row.books) ? row.books[0] : row.books;
        if (!bookRow) continue;
        const book = toBook(bookRow);
        books.push(book);
        nextStatuses[book.id] = row.status;
      }
      setError("");
      setShelf({ userId, books, statuses: nextStatuses });
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  async function toggle(book: Book) {
    if (!userId) return;

    const before = { books: savedBooks, statuses };
    const wasSaved = before.books.some((b) => b.id === book.id);
    setError("");

    if (wasSaved) {
      const { [book.id]: _removed, ...rest } = before.statuses;
      setShelf({
        userId,
        books: before.books.filter((b) => b.id !== book.id),
        statuses: rest,
      });
    } else {
      setShelf({
        userId,
        books: [book, ...before.books],
        statuses: { ...before.statuses, [book.id]: "want_to_read" },
      });
    }

    const { error: dbError } = wasSaved
      ? await supabase
          .from("user_books")
          .delete()
          .eq("user_id", userId)
          .eq("book_id", book.id)
      : await supabase
          .from("user_books")
          .insert({ user_id: userId, book_id: book.id });

    // 23505 = already saved (unique violation), which is fine
    if (dbError && dbError.code !== "23505") {
      setShelf({ userId, ...before });
      setError("Couldn't update your shelf. Please try again.");
    }
  }

  async function setStatus(bookId: string, status: Status) {
    if (!userId) return;

    const before = { books: savedBooks, statuses };
    setError("");
    setShelf({
      userId,
      books: before.books,
      statuses: { ...before.statuses, [bookId]: status },
    });

    const { error: dbError } = await supabase
      .from("user_books")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("book_id", bookId);

    if (dbError) {
      setShelf({ userId, ...before });
      setError("Couldn't update the reading status. Please try again.");
    }
  }

  return { savedBooks, savedIds, statuses, loading, error, toggle, setStatus };
}