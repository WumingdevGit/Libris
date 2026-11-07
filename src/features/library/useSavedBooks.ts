import { useEffect, useRef, useState } from "react";
import type { PostgrestError } from "@supabase/supabase-js";
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
type ShelfData = { books: Book[]; statuses: Record<string, Status> };
type Shelf = ShelfData & { userId: string | null };

async function fetchShelf(userId: string): Promise<ShelfData | null> {
  const { data, error } = await supabase
    .from("user_books")
    .select(`status, created_at, books(${BOOK_COLUMNS})`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Shelf load failed:", error);
    return null;
  }

  const rows = (data ?? []) as unknown as SavedRow[];
  const books: Book[] = [];
  const statuses: Record<string, Status> = {};
  for (const row of rows) {
    const bookRow = Array.isArray(row.books) ? row.books[0] : row.books;
    if (!bookRow) continue;
    const book = toBook(bookRow);
    books.push(book);
    statuses[book.id] = row.status;
  }
  return { books, statuses };
}

export function useSavedBooks() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [shelf, setShelf] = useState<Shelf>({
    userId: null,
    books: [],
    statuses: {},
  });
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const loaded = !!userId && shelf.userId === userId;
  const savedBooks = loaded ? shelf.books : [];
  const statuses: Record<string, Status> = loaded ? shelf.statuses : {};
  const savedIds = savedBooks.map((b) => b.id);
  const loading = !!userId && !loaded;

  // Only the most recent load is allowed to update the screen
  useEffect(() => {
    if (!userId) return;
    let alive = true;
    const id = ++requestId.current;

    (async () => {
      const result = await fetchShelf(userId);
      if (!alive || id !== requestId.current) return;

      if (!result) {
        setError("Couldn't load your shelf. Please refresh.");
        setShelf({ userId, books: [], statuses: {} });
        return;
      }
      setError("");
      setShelf({ userId, ...result });
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  // After every change, re-read the shelf so the screen matches the database
  async function reconcile(uid: string) {
    const id = ++requestId.current;
    const result = await fetchShelf(uid);
    if (id !== requestId.current || !result) return;
    setShelf({ userId: uid, ...result });
  }

  async function toggle(book: Book) {
    if (!userId) return;
    if (!loaded) {
      setError("Your shelf is still loading. Try again in a moment.");
      return;
    }

    const before = { books: savedBooks, statuses };
    const wasSaved = before.books.some((b) => b.id === book.id);
    setError("");

    if (wasSaved) {
      const rest = { ...before.statuses };
      delete rest[book.id];
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
      console.error("Save failed:", dbError);
      setShelf({ userId, ...before });
      setError("Couldn't update your shelf. Please try again.");
      return;
    }
    await reconcile(userId);
  }

  async function setStatus(bookId: string, status: Status) {
    if (!userId || !loaded) return;

    const before = { books: savedBooks, statuses };
    setError("");
    setShelf({
      userId,
      books: before.books,
      statuses: { ...before.statuses, [bookId]: status },
    });

    const now = new Date().toISOString();
    const patch: Record<string, string> = { status, updated_at: now };
    if (status === "finished") patch.finished_at = now;

    const { error: dbError } = await supabase
      .from("user_books")
      .update(patch)
      .eq("user_id", userId)
      .eq("book_id", bookId);

    if (dbError) {
      console.error("Status update failed:", dbError);
      setShelf({ userId, ...before });
      setError("Couldn't update the reading status. Please try again.");
      return;
    }
    await reconcile(userId);
  }

  // Opening the reader: add to the shelf (or move it) as "Reading now"
  async function startReading(book: Book) {
    if (!userId || !loaded) return;

    const isSaved = savedBooks.some((b) => b.id === book.id);
    const current = statuses[book.id];
    if (isSaved && current !== "want_to_read" && current !== "paused") return;

    const before = { books: savedBooks, statuses };
    setError("");
    setShelf({
      userId,
      books: isSaved ? before.books : [book, ...before.books],
      statuses: { ...before.statuses, [book.id]: "currently_reading" },
    });

    const now = new Date().toISOString();
    const startedPatch = current === "want_to_read" ? { started_at: now } : {};
    let dbError: PostgrestError | null;

    if (isSaved) {
      const res = await supabase
        .from("user_books")
        .update({ status: "currently_reading", updated_at: now, ...startedPatch })
        .eq("user_id", userId)
        .eq("book_id", book.id);
      dbError = res.error;
    } else {
      const res = await supabase.from("user_books").insert({
        user_id: userId,
        book_id: book.id,
        status: "currently_reading",
        started_at: now,
      });
      dbError = res.error;
      if (dbError?.code === "23505") {
        const upd = await supabase
          .from("user_books")
          .update({ status: "currently_reading", updated_at: now })
          .eq("user_id", userId)
          .eq("book_id", book.id);
        dbError = upd.error;
      }
    }

    if (dbError) {
      console.error("Start reading failed:", dbError);
      setShelf({ userId, ...before });
      setError("Couldn't update your reading status. Please try again.");
      return;
    }
    await reconcile(userId);
  }

  return {
    savedBooks,
    savedIds,
    statuses,
    loading,
    error,
    toggle,
    setStatus,
    startReading,
  };
}