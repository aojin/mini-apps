// app/news/page.tsx
import { Suspense } from "react";
import InitialHeadlines from "./InitialHeadlines";
import LoadingHeadlines from "./loading";
import Link from "next/link";

export default function NewsPage() {
  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto mt-10 mb-10 p-6 bg-gray-50 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Top Headlines</h1>

      {/* Back navigation */}
      <Link
        href="/"
        className="mb-6 self-start px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back to Mini Apps
      </Link>

      {/* About section */}
      <div className="mb-6 p-4 w-full bg-purple-50 border-l-4 border-purple-400 rounded">
        <h2 className="text-lg font-semibold mb-2">About this app</h2>
        <p>
          A demo news reader built with <strong>Next.js 15</strong> that streams
          headlines from the NewsData.io API. It highlights both{" "}
          <strong>Server Components with Suspense</strong> and{" "}
          <strong>client-side infinite scrolling</strong>.
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
          <li>Server Component data fetching with Suspense boundaries</li>
          <li>Progressive rendering with skeleton placeholders</li>
          <li>IntersectionObserver-powered infinite scroll</li>
          <li>Graceful handling of API rate limits with throttling + retry</li>
        </ul>
        <p className="mt-2 text-sm text-gray-600">
          🔮 Possible enhancements: keyword search, category filters,
          personalization, or offline caching for headline history.
        </p>
      </div>

      {/* Suspense wraps only the first 5 headlines */}
      <Suspense fallback={<LoadingHeadlines />}>
        <InitialHeadlines />
      </Suspense>
    </div>
  );
}
