"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [loading, setLoading] = useState(false);

  return (
  <main className="flex flex-col items-center min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="w-full px-6 py-4 bg-gray shadow flex justify-between items-center">
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
            href="/dynamic-form"
            onClick={() => setLoading(true)}
            className="h-16 flex items-center justify-center rounded bg-gray-600 text-white font-medium hover:bg-gray-700 transition"
          >
            Dynamic Form Builder
          </Link>
          <a
            href="https://orbital-visualizer-131818e262d8.herokuapp.com/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setLoading(true)}
            className="h-16 flex items-center justify-center rounded bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
          >
            Orbital Visualizer
          </a>
          <a
            href="https://fun-runs.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setLoading(true)}
            className="h-16 flex items-center justify-center rounded bg-indigo-600 text-white font-medium hover:bg-pink-700 transition"
          >
            Strava Fun Runs
          </a>
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

        {/* Technologies section */}
        <section className="mt-12 w-full text-center">
          <h3 className="text-xl font-semibold mb-4">Technologies Used</h3>
          <div className="grid grid-cols-3 gap-8 items-center justify-items-center">
            {/* React */}
            <div className="flex flex-col items-center">
              <Image src="/logos/react.svg" alt="React" width={40} height={40} />
              <span className="text-sm mt-1">React</span>
            </div>
            {/* Next.js */}
            <div className="flex flex-col items-center">
              <Image src="/logos/nextjs.svg" alt="Next.js" width={40} height={40} />
              <span className="text-sm mt-1">Next.js</span>
            </div>
            {/* TypeScript */}
            <div className="flex flex-col items-center">
              <Image src="/logos/typescript.svg" alt="TypeScript" width={40} height={40} />
              <span className="text-sm mt-1">TypeScript</span>
            </div>
            {/* Tailwind CSS */}
            <div className="flex flex-col items-center">
              <Image src="/logos/tailwind.svg" alt="Tailwind CSS" width={40} height={40} />
              <span className="text-sm mt-1">Tailwind</span>
            </div>
            {/* APIs */}
            <div className="flex flex-col items-center">
              <Image src="/logos/api.svg" alt="REST APIs" width={40} height={40} />
              <span className="text-sm mt-1">REST APIs</span>
            </div>
            {/* Vercel */}
            <div className="flex flex-col items-center">
              <Image src="/logos/vercel.svg" alt="Vercel" width={40} height={40} />
              <span className="text-sm mt-1">Vercel</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
