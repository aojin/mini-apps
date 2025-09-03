// app/news/DelayedNewsFeed.tsx
"use client";
import { useEffect, useState } from "react";
import NewsFeed from "./NewsFeed";
import type { Article } from "./fetchInitialHeadlines";

export default function DelayedNewsFeed({
  nextPage,
  initialArticles,
}: {
  nextPage: string;
  initialArticles: Article[];
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2000); // wait 2s
    return () => clearTimeout(t);
  }, []);

  if (!ready) {
    return (
      <div className="text-gray-400 text-sm text-center mt-4">
        Preparing more headlines…
      </div>
    );
  }

  return <NewsFeed initialNextPage={nextPage} initialArticles={initialArticles} />;
}
