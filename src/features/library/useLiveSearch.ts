import { useEffect, useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../../services/supabase/client";
import { toBook, type Book, type BookRow } from "./books";

type Result = { q: string; books: Book[]; error: string };

export function useLiveSearch(query: string) {
  const term = query.trim();
  const [debounced, setDebounced] = useState("");
  const [result, setResult] = useState<Result>({ q: "", books: [], error: "" });

  // Wait until the person pauses typing
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(term), 450);
    return () => window.clearTimeout(t);
  }, [term]);

  useEffect(() => {
    if (debounced.length < 2) return;
    let alive = true;

    (async () => {
      const { data, error } = await supabase.functions.invoke("search-books", {
        body: { q: debounced },
      });
      if (!alive) return;

      if (error) {
        const tooMany =
          error instanceof FunctionsHttpError && error.context.status === 429;
        setResult({
          q: debounced,
          books: [],
          error: tooMany
            ? "Too many searches. Wait a minute and try again."
            : "Live search is unavailable right now. Please try again shortly.",
        });
        return;
      }

      const rows = (data?.books ?? []) as BookRow[];
      setResult({ q: debounced, books: rows.map(toBook), error: "" });
    })();

    return () => {
      alive = false;
    };
  }, [debounced]);

  const active = term.length >= 2;
  const settled = active && term === debounced && result.q === debounced;

  return {
    active,
    loading: active && !settled,
    books: settled ? result.books : [],
    error: settled ? result.error : "",
  };
}