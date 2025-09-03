"use client";
import React from "react";
import Link from "next/link";

interface Session {
  id: number;
  score: number;
  total: number;
  date: string;
}

interface QuizHistoryProps {
  history: Session[];
  onClear?: () => void; // 👈 optional clear callback
}

export default function QuizHistory({ history, onClear }: QuizHistoryProps) {
  if (!history.length) return null;

  return (
    <div className="mt-8 w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Previous Quizzes</h2>
        {onClear && (
          <button
            onClick={onClear}
            className="text-sm text-red-600 hover:underline"
          >
            Clear History
          </button>
        )}
      </div>
      <ul className="space-y-2">
        {history.map((s) => (
          <li key={s.id} className="p-2 border rounded bg-white shadow-sm">
            <Link
              href={`/quiz/${s.id}`}
              className="text-blue-600 hover:underline"
            >
              {s.date} – {s.score} / {s.total}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
