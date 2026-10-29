import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase/client";
import { useAuth } from "../auth/AuthContext";
import { BOOK_COLUMNS, toBook, type Book, type BookRow } from "./books";

type SavedRow = { books: BookRow | BookRow[] | null };

export function useSavedBooks() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [state, setState] = useState<{ userId: string | null; books: Book[] }>({
    userId: null,
    books: [],
  });
  const [error, setError] = useState("");

  const loaded = !!userId && state.userId === userId;
  const savedBooks = loaded ? state.books : [];
  const savedIds = savedBooks.map((b) => b.id);
  const loading = !!userId && !loaded;

  useEffect(() => {
    if (!userId) return;
    let alive = true;

    (async () => {
      const { data, error: dbError } = await supabase
        .from("user_books")
        .select(`created_at, books(${BOOK_COLUMNS})`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!alive) return;

      if (dbError) {
        setError("Couldn't load your shelf. Please refresh.");
        setState({ userId, books: [] });
        return;
      }

      const rows = (data ?? []) as unknown as SavedRow[];
      const books = rows
        .flatMap((r) => (Array.isArray(r.books) ? r.books : r.books ? [r.books] : []))
        .map(toBook);
      setError("");
      setState({ userId, books });
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  async function toggle(book: Book) {
    if (!userId) return;

    const before = savedBooks;
    const wasSaved = before.some((b) => b.id === book.id);
    setError("");
    setState({
      userId,
      books: wasSaved ? before.filter((b) => b.id !== book.id) : [book, ...before],
    });

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
      setState({ userId, books: before });
      setError("Couldn't update your shelf. Please try again.");
    }
  }

  return { savedBooks, savedIds, loading, error, toggle };
}