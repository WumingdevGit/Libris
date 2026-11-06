import { useState } from "react";
import { BookOpen } from "lucide-react";

export default function Cover({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="book-cover book-cover-empty" aria-hidden="true">
        <BookOpen size={30} strokeWidth={1.4} />
      </div>
    );
  }
  return (
    <img
      className="book-cover"
      src={src}
      alt={`Cover of ${title}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}