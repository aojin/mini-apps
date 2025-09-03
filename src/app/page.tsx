export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen space-y-6">
      <h1 className="text-3xl font-bold">Mini Apps Showcase</h1>
      <a
        href="/weather"
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Weather App
      </a>
      <a
        href="/notes"
        className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Notes App
      </a>
      <a
        href="/crypto"
        className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Crypto Tracker App
      </a>
      <a
        href="/news"
        className="px-6 py-3 bg-yellow-600 text-white rounded hover:bg-yellow-700"
      >
        News Headline App
      </a>
      <a
        href="/timer"
        className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Pomodoro Timer App
      </a>
      <a
        href="/quiz"
        className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Quiz App
      </a>
    </main>
  );
}
