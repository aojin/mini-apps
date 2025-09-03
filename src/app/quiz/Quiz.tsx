"use client";
import React, { useState } from "react";

interface Question {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

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

interface QuizProps {
  onComplete: (session: Session) => void;
}

export default function Quiz({ onComplete }: QuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchQuiz() {
    setLoading(true);
    setError(null);
    try {
        const res = await fetch("https://opentdb.com/api.php?amount=5&type=multiple");
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();

        if (data.results?.length) {
        setQuestions(data.results);
        setCurrent(0);
        setScore(0);
        setFinished(false);
        setResults([]);
        setStarted(true);
        } else {
        throw new Error("No quiz questions returned");
        }
    } catch (err: unknown) {
        console.error("Failed to fetch quiz:", err);
        if (err instanceof Error) {
        setError(err.message);
        } else {
        setError("Failed to load quiz");
        }
    } finally {
        setLoading(false);
    }
    }


  function shuffleAnswers(q: Question) {
    return [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
  }

  function handleAnswer(answer: string) {
    const q = questions[current];
    if (!q) return;

    const isCorrect = answer === q.correct_answer;
    const updatedScore = isCorrect ? score + 1 : score;

    const questionResult: QuestionResult = {
      question: q.question,
      correct_answer: q.correct_answer,
      chosen_answer: answer,
      all_answers: shuffleAnswers(q),
    };

    const updatedResults = [...results, questionResult];

    if (current + 1 < questions.length) {
      setScore(updatedScore);
      setResults(updatedResults);
      setCurrent((c) => c + 1);
    } else {
      setScore(updatedScore);
      setResults(updatedResults);
      setFinished(true);

      const newSession: Session = {
        id: Date.now(),
        score: updatedScore,
        total: questions.length,
        date: new Date().toLocaleString(),
        questions: updatedResults,
      };

      onComplete(newSession);
    }
  }

  // ---------- Render ----------
  if (!started) {
    return (
      <div className="text-center">
        <button
          onClick={fetchQuiz}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Loading..." : "Start Quiz"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  if (finished) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Quiz Finished!</h2>
        <p className="mt-2">
          You scored {score} / {questions.length}
        </p>
        <button
          onClick={fetchQuiz}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Start New Quiz
        </button>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return null;

  const answers = shuffleAnswers(q);

  function decodeHtml(html: string) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  return (
    <div className="w-full">
      <p className="mb-2 font-medium">
        Question {current + 1} / {questions.length}
      </p>

      <p className="mb-4">{decodeHtml(q.question)}</p>

      <div className="space-y-2">
        {answers.map((a, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(a)}
            className="w-full px-4 py-2 bg-white border rounded hover:bg-gray-100 text-left"
          >
            {decodeHtml(a)}
          </button>
        ))}
      </div>
    </div>
  );
}
