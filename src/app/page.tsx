"use client";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(false);

  return (
    <main className="flex flex-col items-center min-h-screen bg-gray-50">
      {/* Header */}
      <header className="w-full px-6 py-4 bg-white shadow flex justify-between items-center">
        <h1 className="text-xl font-bold">Alex Jin – Full Stack Developer</h1>
        <div className="space-x-4 text-sm">
          <a
            href="https://www.linkedin.com/in/alex-jin-dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            LinkedIn
          </a>
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Resume
          </a>
        </div>
      </header>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Page content */}
      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto space-y-4 mt-10">
        <h2 className="text-3xl font-bold mb-6">Mini Apps Showcase</h2>

        {/* Buttons grid */}
        <div className="grid grid-cols-1 gap-4 w-full">
          <Link
            href="/quiz"
            onClick={() => setLoading(true)}
            className="h-16 flex items-center justify-center rounded bg-cyan-600 text-white font-medium hover:bg-cyan-700 transition"
          >
            Quiz App
          </Link>
          <Link
            href="/news"
            onClick={() => setLoading(true)}
            className="h-16 flex items-center justify-center rounded bg-yellow-600 text-white font-medium hover:bg-yellow-700 transition"
          >
            News Headline App
          </Link>
          <Link
            href="/weather"
            onClick={() => setLoading(true)}
            className="h-16 flex items-center justify-center rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            Weather App
          </Link>
          <Link
            href="/notes"
            onClick={() => setLoading(true)}
            className="h-16 flex items-center justify-center rounded bg-green-600 text-white font-medium hover:bg-green-700 transition"
          >
            Notes App
          </Link>
          <Link
            href="/crypto"
            onClick={() => setLoading(true)}
            className="h-16 flex items-center justify-center rounded bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Crypto Tracker App
          </Link>
          <Link
            href="/timer"
            onClick={() => setLoading(true)}
            className="h-16 flex items-center justify-center rounded bg-purple-600 text-white font-medium hover:bg-purple-700 transition"
          >
            Pomodoro Timer App
          </Link>
        </div>
      </div>
    </main>
  );
}
