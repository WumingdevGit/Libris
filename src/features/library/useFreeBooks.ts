import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase/client";
import { BOOK_COLUMNS, toBook, type Book, type BookRow } from "./books";

export const FREE_TOPICS = [
  { key: "classics", label: "Classics" },
  { key: "romance", label: "Romance" },
  { key: "fantasy", label: "Fantasy" },
  { key: "scifi", label: "Science fiction" },
  { key: "horror", label: "Horror" },
  { key: "adventure", label: "Adventure" },
] as const;

const SUBJECT_BY_TOPIC: Record<string, string> = {
  classics: "Classics",
  romance: "Romance",
  fantasy: "Fantasy",
  scifi: "Science fiction",
  horror: "Horror",
  adventure: "Adventure",
};

type Result = { topic: string; books: Book[]; error: string };

export function useFreeBooks(topic: string | null) {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!topic) return;
    let alive = true;

    (async () => {
      let query = supabase
        .from("books")
        .select(BOOK_COLUMNS)
        .eq("provider", "gutenberg")
        .order("title");

      const subject = SUBJECT_BY_TOPIC[topic];
      if (subject) query = query.contains("subjects", [subject]);

      const { data, error } = await query;
      if (!alive) return;

      if (error) {
        console.error("Free books load failed:", error);
        setResult({
          topic,
          books: [],
          error: "Couldn't load free books right now. Please try again shortly.",
        });
        return;
      }

      const rows = (data ?? []) as BookRow[];
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