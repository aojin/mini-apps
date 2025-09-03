"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Quiz from "./Quiz";
import QuizHistory from "./QuizHistory";

interface QuestionResult {
  question: string;
  correct_answer: string;
  chosen_answer: string;
  all_answers: string[];
}

interface Session {
  id: number;
  score: number;
  total: number;
  date: string;
  questions: QuestionResult[];
}

export default function QuizPage() {
  const [history, setHistory] = useState<Session[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("quizHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const addSession = (session: Session) => {
    const updated = [...history, session];
    setHistory(updated);
    localStorage.setItem("quizHistory", JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto mt-10 mb-10 p-6 bg-gray-50 rounded-xl shadow">
      {/* Back button */}
      <div className="self-start mb-4">
        <Link
          href="/"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Mini Apps
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Trivia Quiz 🧠</h1>

      <div className="mb-6 p-4 w-full bg-blue-50 border-l-4 border-blue-400 rounded">
        <h2 className="text-lg font-semibold mb-2">About this app</h2>
        <p>
          A lightweight quiz app powered by the Open Trivia DB. It demonstrates
          common React patterns for building interactive UIs and persisting state
          across sessions.
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
          <li>Client-side data fetching with error handling</li>
          <li>State management for multi-step quiz flow</li>
          <li>Dynamic rendering of correctness and scores</li>
          <li>LocalStorage persistence for quiz history</li>
          <li>Conditional rendering (start screen, in-progress, results)</li>
        </ul>
        <p className="mt-2 text-sm text-gray-600">
          🔮 Possible enhancements: categories, difficulty selection, timed quizzes,
          or syncing history to a backend.
        </p>
      </div>

      <Quiz onComplete={addSession} />

      <QuizHistory
        history={history}
        onClear={() => {
          localStorage.removeItem("quizHistory");
          setHistory([]);
        }}
      />
    </div>
  );
}
