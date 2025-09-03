"use client";
import { useState, useEffect } from "react";
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
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Trivia Quiz 🧠</h1>

      <div className="mb-6 p-4 w-full bg-blue-50 border-l-4 border-blue-400 rounded">
        <h2 className="text-lg font-semibold mb-2">About this app</h2>
        <p>
          Answer multiple-choice questions from the Open Trivia DB.
          Your scores are saved so you can track past quizzes and start new ones.
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
          <li>React state & effects for quiz flow</li>
          <li>LocalStorage persistence for quiz history</li>
          <li>Dynamic rendering of answer correctness</li>
        </ul>
        <p className="mt-2 text-sm text-gray-600">
          🔮 Possible features: categories, difficulty selection, timed quizzes.
        </p>
      </div>

      {/* No ref/reset logic anymore */}
      <Quiz onComplete={addSession} />

      <QuizHistory history={history} />
    </div>
  );
}
