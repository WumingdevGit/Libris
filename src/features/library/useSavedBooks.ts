import { useEffect, useRef, useState } from "react";
import { supabase } from "../../services/supabase/client";
import { useAuth } from "../auth/AuthContext";

type BookRow = { id: string; provider_book_id: string };

export function useSavedBooks() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [state, setState] = useState<{ userId: string | null; ids: string[] }>({
    userId: null,
    ids: [],
  });
  const [error, setError] = useState("");
  const uuidBySlug = useRef<Map<string, string>>(new Map());

  const loaded = !!userId && state.userId === userId;
  const savedIds = loaded ? state.ids : [];
  const loading = !!userId && !loaded;

  useEffect(() => {
    if (!userId) return;
    let alive = true;

    (async () => {
      const [booksRes, savedRes] = await Promise.all([
        supabase
          .from("books")
          .select("id, provider_book_id")
          .eq("provider", "sample"),
        supabase.from("user_books").select("book_id").eq("user_id", userId),
      ]);
      if (!alive) return;

      if (booksRes.error || savedRes.error) {
        setError("Couldn't load your shelf. Please refresh.");
        setState({ userId, ids: [] });
        return;
      }

      const books = (booksRes.data ?? []) as BookRow[];
      uuidBySlug.current = new Map(books.map((b) => [b.provider_book_id, b.id]));

      const savedUuids = new Set(
        ((savedRes.data ?? []) as { book_id: string }[]).map((r) => r.book_id)
      );
      setError("");
      setState({
        userId,
        ids: books.filter((b) => savedUuids.has(b.id)).map((b) => b.provider_book_id),
      });
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  async function toggle(slug: string) {
    if (!userId) return;
    const bookUuid = uuidBySlug.current.get(slug);
    if (!bookUuid) {
      setError("This book isn't in the database yet.");
      return;
    }

    const before = savedIds;
    const wasSaved = before.includes(slug);
    setError("");
    setState({
      userId,
      ids: wasSaved ? before.filter((id) => id !== slug) : [...before, slug],
    });

    const { error: dbError } = wasSaved
      ? await supabase
          .from("user_books")
          .delete()
          .eq("user_id", userId)
          .eq("book_id", bookUuid)
      : await supabase
          .from("user_books")
          .insert({ user_id: userId, book_id: bookUuid });

    // 23505 = already saved (unique violation), which is fine
    if (dbError && dbError.code !== "23505") {
      setState({ userId, ids: before });
      setError("Couldn't update your shelf. Please try again.");
    }
  }

  return { savedIds, loading, error, toggle };
}