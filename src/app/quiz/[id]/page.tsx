"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

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

export default function QuizDetailPage() {
  const { id } = useParams(); // comes from /quiz/[id]
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("quizHistory");
    if (saved) {
      const history: Session[] = JSON.parse(saved);
      const found = history.find((s) => s.id.toString() === id);
      if (found) setSession(found);
    }
  }, [id]);

  // Open Trivia sends questions and answers sometimes with baked in HTML entities like &quot;
  function decodeHtml(html: string) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  if (!session) return <p>Loading quiz details...</p>;

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow">
      {/* Back link */}
      <div className="self-start mb-4">
        <Link
          href="/quiz"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Quizzes
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">Quiz from {session.date}</h1>
      <p className="mb-6">
        Score: {session.score} / {session.total}
      </p>

      <div className="space-y-6 w-full">
        {session.questions.map((q, idx) => (
          <div key={idx} className="p-4 border rounded bg-white shadow-sm">
            <p className="font-medium mb-2">
              {idx + 1}. {decodeHtml(q.question)}
            </p>
            <ul className="space-y-1">
              {q.all_answers.map((a, i) => {
                const isCorrect = a === q.correct_answer;
                const isChosen = a === q.chosen_answer;
                return (
                  <li
                    key={i}
                    className={`px-2 py-1 rounded ${
                      isCorrect
                        ? "bg-green-100 text-green-800"
                        : isChosen
                        ? "bg-red-100 text-red-800"
                        : ""
                    }`}
                  >
                    {decodeHtml(a)}
                    {isCorrect && " ✅"}
                    {isChosen && !isCorrect && " ❌"}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
