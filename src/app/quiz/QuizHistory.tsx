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
}

export default function QuizHistory({ history }: QuizHistoryProps) {
  if (!history.length) return null;

  return (
    <div className="mt-8 w-full">
      <h2 className="text-lg font-semibold mb-2">Previous Quizzes</h2>
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
