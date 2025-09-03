import { Suspense } from "react";
import InitialHeadlines from "./InitialHeadlines";
import NewsFeed from "./NewsFeed";
import LoadingHeadlines from "./loading";
import { fetchInitialHeadlines } from "./fetchInitialHeadlines";

export default async function NewsPage() {
  const { nextPage } = await fetchInitialHeadlines();

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Top Headlines</h1>

      <div className="mb-6 p-4 w-full bg-purple-50 border-l-4 border-purple-400 rounded">
        <h2 className="text-lg font-semibold mb-2">About this app</h2>
        <p>
            A news reader that fetches top headlines using NewsData.io API. The first 5
            headlines are streamed in with Suspense, and additional results are loaded
            via infinite scroll with IntersectionObserver.
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
            <li>Next.js 15 Server Components with Suspense</li>
            <li>IntersectionObserver for infinite scrolling</li>
            <li>Progressive rendering with skeleton placeholders</li>
        </ul>
        <p className="mt-2 text-sm text-gray-600">
            🔮 Possible features: search by keyword, category filters, save/favorite
            articles.
        </p>
      </div>

      {/* Suspense for the first 5 headlines */}
      <Suspense fallback={<LoadingHeadlines />}>
        <InitialHeadlines />
      </Suspense>

      {/* Infinite scroll picks up where InitialHeadlines left off */}
      <NewsFeed initialNextPage={nextPage} />
    </div>
  );
}
