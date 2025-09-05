// app/news/InitialHeadlines.tsx
import { fetchInitialHeadlines, Article } from "./fetchInitialHeadlines";
import DelayedNewsFeed from "./DelayedNewsFeed";

// bring in grouping logic (you can extract this into a shared util if reused)
interface GroupedArticle {
  title: string;
  link: string;
  sources: string[];
}

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

export default async function InitialHeadlines() {
  const { results, nextPage, error } = await fetchInitialHeadlines();
  const grouped = groupArticles(results);

  return (
    <>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {grouped.length > 0 && (
        <ul className="w-full space-y-4">
          {grouped.slice(0, 5).map((a, idx) => (
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
              <p className="text-gray-600 text-sm mt-1">
                {a.sources.length > 1
                  ? `Seen in ${a.sources.length} sources (${a.sources
                      .slice(0, 3)
                      .join(", ")}${a.sources.length > 3 ? "…" : ""})`
                  : `Source: ${a.sources[0]}`}
              </p>
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
