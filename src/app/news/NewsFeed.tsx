"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

// ——— Types ———
interface Article {
  title: string;
  link: string;
  source_id: string;
}

interface GroupedArticle {
  title: string;
  link: string;
  sources: string[]; // all source_ids for this article
}

interface NewsFeedProps {
  initialNextPage: string | null;
  initialArticles: Article[];
}

// ——— Utility: group duplicates by normalized title ———
function groupArticles(articles: Article[]): GroupedArticle[] {
  const groups = new Map<string, GroupedArticle>();

  for (const article of articles) {
    const normalized = article.title.toLowerCase().replace(/[^\w\s]/g, "");
    if (!groups.has(normalized)) {
      groups.set(normalized, {
        title: article.title,
        link: article.link,
        sources: [article.source_id],
      });
    } else {
      groups.get(normalized)!.sources.push(article.source_id);
    }
  }

  return Array.from(groups.values());
}

// ——— Component ———
export default function NewsFeed({
  initialNextPage,
  initialArticles,
}: NewsFeedProps) {
  const [articles, setArticles] = useState<GroupedArticle[]>(
    groupArticles(initialArticles || [])
  );
  const [nextPage, setNextPage] = useState<string | null>(initialNextPage);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const retryRef = useRef<NodeJS.Timeout | null>(null);
  const retryDelayRef = useRef(3000); // backoff starts at 3s

  // ——— Fetch + deduplicate ———
  const fetchPage = useCallback(
    async (pageToken: string, isRetry = false) => {
      if (loading && !isRetry) return;
      if (!pageToken) return;

      setLoading(true);
      setCooldown(false);

      try {
        const url = `https://newsdata.io/api/1/news?apikey=${
          process.env.NEXT_PUBLIC_NEWSDATA_KEY
        }&country=us&language=en&category=top&page=${pageToken}`;

        const res = await fetch(url);

        // Handle rate limiting
        if (res.status === 429) {
          console.warn(
            `Rate limit hit. Retrying in ${retryDelayRef.current / 1000}s`
          );
          setCooldown(true);

          retryRef.current = setTimeout(() => {
            fetchPage(pageToken, true); // force retry
            retryDelayRef.current = Math.min(
              retryDelayRef.current * 2,
              30000
            ); // exponential backoff
          }, retryDelayRef.current);

          return;
        }

        retryDelayRef.current = 3000; // reset delay on success

        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();

        if (data.results) {
          setArticles((prev) =>
            groupArticles([
              ...prev.map((a) => ({
                title: a.title,
                link: a.link,
                source_id: a.sources[0],
              })), // flatten back for regrouping
              ...data.results,
            ])
          );
        }

        setNextPage(data.nextPage || null);
      } catch (err) {
        console.error("Pagination error:", err);
      } finally {
        setLoading(false);
        setCooldown(false);
      }
    },
    [loading]
  );

  // ——— Infinite scroll observer ———
  useEffect(() => {
    if (!observerRef.current || !nextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPage && !loading && !cooldown) {
          fetchPage(nextPage);
        }
      },
      { rootMargin: "200px" }
    );

    const el = observerRef.current;
    observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [nextPage, fetchPage, loading, cooldown]);

  // ——— Render ———
  return (
    <div className="w-full space-y-4">
      {articles.map((a, idx) => (
        <div
          key={idx}
          className="p-4 bg-white rounded shadow hover:shadow-md transition"
        >
          <a
            href={a.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 font-semibold hover:underline"
          >
            {a.title}
          </a>
          <p className="text-gray-600 text-sm mt-1">
            {a.sources.length > 1
              ? `Seen in ${a.sources.length} sources (${a.sources
                  .slice(0, 3)
                  .join(", ")}${a.sources.length > 3 ? "…" : ""})`
              : `Source: ${a.sources[0]}`}
          </p>
        </div>
      ))}

      {nextPage && (
        <div ref={observerRef} className="h-10 flex items-center justify-center">
          {loading && <p className="text-gray-500">Loading more…</p>}
          {cooldown && !loading && (
            <p className="text-gray-400 text-sm">
              ⏳ Rate limit hit, retrying in {retryDelayRef.current / 1000}s…
            </p>
          )}
          {!loading && cooldown && (
            <button
              onClick={() => fetchPage(nextPage, true)}
              className="ml-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry Now
            </button>
          )}
        </div>
      )}

      {!nextPage && !loading && articles.length > 0 && (
        <p className="text-gray-400 text-center">No more results</p>
      )}
    </div>
  );
}
