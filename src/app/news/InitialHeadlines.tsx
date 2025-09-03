import { fetchInitialHeadlines, Article } from "./fetchInitialHeadlines";

export default async function InitialHeadlines() {
  const { results } = await fetchInitialHeadlines();

  return (
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
  );
}
