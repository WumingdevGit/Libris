import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../../services/supabase/client";

export type Locator = { c: number; p: number }; // chapter, paragraph

function parseLocator(raw: string | null | undefined): Locator | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (Number.isInteger(v?.c) && Number.isInteger(v?.p) && v.c >= 0 && v.p >= 0) {
      return { c: v.c, p: v.p };
    }
  } catch {
    // An unreadable saved position is ignored
  }
  return null;
}

type Loaded = { key: string; locator: Locator | null };

export function useReadingProgress(
  bookId: string,
  userId: string | null,
  shelfReady: boolean,
) {
  const key = userId ? `${userId}:${bookId}` : null;
  const [state, setState] = useState<Loaded | null>(null);
  const [gaveUp, setGaveUp] = useState<string | null>(null);
  const userBookId = useRef<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  // Don't wait forever if the shelf never becomes ready
  useEffect(() => {
    if (!key) return;
    const t = window.setTimeout(() => setGaveUp(key), 6000);
    return () => window.clearTimeout(t);
  }, [key]);

  useEffect(() => {
    if (!key || !userId || !shelfReady) return;
    let alive = true;

    (async () => {
      // The shelf row is created a moment after opening the reader
      let id: string | null = null;
      for (let attempt = 0; attempt < 6 && !id; attempt++) {
        const { data } = await supabase
          .from("user_books")
          .select("id")
          .eq("user_id", userId)
          .eq("book_id", bookId)
          .maybeSingle();
        if (!alive) return;
        id = data?.id ?? null;
        if (!id) await new Promise((resolve) => window.setTimeout(resolve, 600));
      }

      let locator: Locator | null = null;
      if (id) {
        const { data } = await supabase
          .from("reading_progress")
          .select("locator")
          .eq("user_book_id", id)
          .maybeSingle();
        locator = parseLocator(data?.locator);
      }
      if (!alive) return;

      userBookId.current = id;
      setState({ key, locator });
    })();

    return () => {
      alive = false;
    };
  }, [key, userId, bookId, shelfReady]);

  const loaded = !key || state?.key === key || gaveUp === key;
  const locator = state?.key === key ? state.locator : null;

  const save = useCallback(
    (position: Locator, percent: number) => {
      window.clearTimeout(timer.current);
      // Left to finish even if the reader closes, so the last spot is kept
      timer.current = window.setTimeout(async () => {
        const id = userBookId.current;
        if (!id || !userId) return;
        const { error } = await supabase.from("reading_progress").upsert(
          {
            user_id: userId,
            user_book_id: id,
            progress_percent: Math.min(100, Math.max(0, Math.round(percent * 10) / 10)),
            locator: JSON.stringify(position),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_book_id" },
        );
        if (error) console.error("Saving progress failed:", error);
      }, 800);
    },
    [userId],
  );

  return { loaded, locator, save };
}