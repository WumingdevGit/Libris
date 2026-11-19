import { useEffect, useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../../services/supabase/client";
import { toBook, type Book, type BookRow } from "./books";

export const FREE_TOPICS = [
  { key: "classics", label: "Classics" },
  { key: "mystery", label: "Mystery" },
  { key: "scifi", label: "Science fiction" },
  { key: "romance", label: "Romance" },
  { key: "poetry", label: "Poetry" },
  { key: "philosophy", label: "Philosophy" },
  { key: "history", label: "History" },
  { key: "adventure", label: "Adventure" },
] as const;

type Result = { topic: string; books: Book[]; error: string };

export function useFreeBooks(topic: string | null) {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!topic) return;
    let alive = true;

    (async () => {
      const { data, error } = await supabase.functions.invoke("search-books", {
        body: { browse: topic },
      });
      if (!alive) return;

      if (error) {
        const tooMany =
          error instanceof FunctionsHttpError && error.context.status === 429;
        setResult({
          topic,
          books: [],
          error: tooMany
            ? "Too many requests. Wait a minute and try again."
            : "Couldn't load free books right now. Please try again shortly.",
        });
        return;
      }

      const rows = (data?.books ?? []) as BookRow[];
      setResult({ topic, books: rows.map(toBook), error: "" });
    })();

    return () => {
      alive = false;
    };
  }, [topic]);

  const settled = !!topic && result?.topic === topic;
  return {
    loading: !!topic && !settled,
    books: settled && result ? result.books : [],
    error: settled && result ? result.error : "",
  };
}