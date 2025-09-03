"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

interface Article {
  title: string;
  link: string;
  source_id: string;
}

interface NewsFeedProps {
  initialNextPage: string | null;
}

export default function NewsFeed({ initialNextPage }: NewsFeedProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [nextPage, setNextPage] = useState<string | null>(initialNextPage);
  const [loading, setLoading] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(
    async (pageToken?: string) => {
        if (loading) return;
        if (pageToken === null) return; // no more pages
        setLoading(true);

        try {
        const url = pageToken
            ? `https://newsdata.io/api/1/news?apikey=${process.env.NEXT_PUBLIC_NEWSDATA_KEY}&country=us&language=en&category=top&page=${pageToken}`
            : `https://newsdata.io/api/1/news?apikey=${process.env.NEXT_PUBLIC_NEWSDATA_KEY}&country=us&language=en&category=top`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();

        if (data.results) {
            setArticles((prev) => [...prev, ...data.results]);
        }

        setNextPage(data.nextPage || null);
        } catch (err) {
        console.error("Pagination error:", err);
        } finally {
        setLoading(false);
        }
    },
    [loading]
    );

  // intersection observer
  useEffect(() => {
    if (!observerRef.current || !nextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextPage && !loading) {
          fetchPage(nextPage);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [nextPage, fetchPage, loading]);

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
          <p className="text-gray-600 text-sm mt-1">{a.source_id}</p>
        </div>
      ))}

      {/* Sentinel only if there’s another page */}
      {nextPage && (
        <div ref={observerRef} className="h-10 flex items-center justify-center">
          {loading && <p className="text-gray-500">Loading more...</p>}
        </div>
      )}

      {/* Show end message when done */}
      {!nextPage && !loading && articles.length > 0 && (
        <p className="text-gray-400 text-center">No more results</p>
      )}
    </div>
  );
}
