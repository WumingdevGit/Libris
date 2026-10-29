import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase/client";
import { BOOK_COLUMNS, toBook, type Book, type BookRow } from "./books";

const ORDER = [
  "midnight-library",
  "educated",
  "small-things",
  "design-everyday",
  "song-achilles",
  "atomic-habits",
];

type SampleRow = BookRow & { provider_book_id: string };

export function useSampleBooks() {
  const [state, setState] = useState<{
    books: Book[];
    loading: boolean;
    error: string;
  }>({ books: [], loading: true, error: "" });

  useEffect(() => {
    let alive = true;

    (async () => {
      const { data, error } = await supabase
        .from("books")
        .select(`${BOOK_COLUMNS}, provider_book_id`)
        .eq("provider", "sample");
      if (!alive) return;

      if (error) {
        setState({ books: [], loading: false, error: "Couldn't load books." });
        return;
      }

      const rows = (data ?? []) as SampleRow[];
      rows.sort(
        (a, b) => ORDER.indexOf(a.provider_book_id) - ORDER.indexOf(b.provider_book_id)
      );
      setState({ books: rows.map(toBook), loading: false, error: "" });
    })();

    return () => {
      alive = false;
    };
  }, []);

  return state;
}