// app/news/loading.tsx
export default function LoadingHeadlines() {
  return (
    <ul className="w-full space-y-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, idx) => (
        <li
          key={idx}
          className="p-4 bg-white rounded shadow space-y-2"
        >
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </li>
      ))}
    </ul>
  );
}
