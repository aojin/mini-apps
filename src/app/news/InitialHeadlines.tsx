// app/news/InitialHeadlines.tsx
import { fetchInitialHeadlines, Article } from "./fetchInitialHeadlines";
import DelayedNewsFeed from "./DelayedNewsFeed";

export default async function InitialHeadlines() {
  const { results, nextPage, error } = await fetchInitialHeadlines();

  return (
    <>
      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {results.length > 0 && (
        <ul className="w-full space-y-4">
          {results.slice(0, 5).map((a: Article, idx: number) => (
            <li
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
            </li>
          ))}
        </ul>
      )}

      {/* ✅ Only mount NewsFeed after a delay */}
      {nextPage && (
        <DelayedNewsFeed
          nextPage={nextPage}
          initialArticles={results.slice(5)}
        />
      )}
    </>
  );
}
