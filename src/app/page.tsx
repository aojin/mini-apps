"use client";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(false);

  return (
    <main className="flex flex-col items-center justify-center h-screen space-y-6 relative">
      <h1 className="text-3xl font-bold">Mini Apps Showcase</h1>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          {/* Blue spinner */}
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <Link
        href="/quiz"
        onClick={() => setLoading(true)}
        className="px-6 py-3 bg-cyan-600 text-white rounded hover:bg-cyan-700"
      >
        Quiz App
      </Link>
      <Link
        href="/news"
        onClick={() => setLoading(true)}
        className="px-6 py-3 bg-yellow-600 text-white rounded hover:bg-yellow-700"
      >
        News Headline App
      </Link>
      <Link
        href="/weather"
        onClick={() => setLoading(true)}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Weather App
      </Link>
      <Link
        href="/notes"
        onClick={() => setLoading(true)}
        className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Notes App
      </Link>
      <Link
        href="/crypto"
        onClick={() => setLoading(true)}
        className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Crypto Tracker App
      </Link>
      <Link
        href="/timer"
        onClick={() => setLoading(true)}
        className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Pomodoro Timer App
      </Link>
    </main>
  );
}
