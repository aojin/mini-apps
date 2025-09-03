export default function LoadingQuiz() {
  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow animate-pulse">
      {/* Title placeholder */}
      <div className="h-6 w-1/3 bg-gray-300 rounded mb-6" />

      {/* Question placeholder */}
      <div className="h-4 w-3/4 bg-gray-300 rounded mb-4" />
      <div className="h-4 w-2/3 bg-gray-200 rounded mb-8" />

      {/* Answer buttons placeholder */}
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="h-10 w-full bg-gray-200 rounded mb-3"
        />
      ))}
    </div>
  );
}
