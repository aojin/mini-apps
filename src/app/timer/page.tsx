"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function TimerPage() {
  const WORK_TIME = 25 * 60; // 25 minutes
  const BREAK_TIME = 5 * 60; // 5 minutes

  const [time, setTime] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [sessions, setSessions] = useState<number>(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Format seconds → mm:ss
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // --- Progress (0–1)
  const total = mode === "work" ? WORK_TIME : BREAK_TIME;
  const progress = 1 - time / total;

  // --- Notifications
  const notify = (message: string) => {
    if (Notification.permission === "granted") {
      new Notification(message);
    }
  };

  // Ask for permission once
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // --- Timer effect
  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0) {
      if (mode === "work") {
        setMode("break");
        setTime(BREAK_TIME);
        setSessions((prev) => prev + 1);
        notify("🎉 Work session complete! Take a break.");
      } else {
        setMode("work");
        setTime(WORK_TIME);
        notify("⏰ Break is over! Back to work.");
      }
      setIsRunning(false);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, time, mode]);

  // --- Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem("sessions", sessions.toString());
  }, [sessions]);

  // --- Load sessions on mount
  useEffect(() => {
    const saved = localStorage.getItem("sessions");
    if (saved) setSessions(parseInt(saved));
  }, []);

  const handleStartPause = () => setIsRunning((prev) => !prev);
  const handleReset = () => {
    setIsRunning(false);
    setTime(mode === "work" ? WORK_TIME : BREAK_TIME);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto mt-10 mb-10 p-6 bg-gray-50 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6">Task Timer ⏱️</h1>

      {/* Back navigation */}
      <Link
        href="/"
        className="mb-6 self-start px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back to Mini Apps
      </Link>

      {/* Info box */}
      <div className="mt-6 mb-6 p-4 w-full bg-blue-50 border-l-4 border-blue-400 rounded">
        <h2 className="text-lg font-semibold mb-2">About this app</h2>
        <p>
          A Pomodoro-style timer that alternates 25-minute work sessions and
          5-minute breaks. Shows progress and sends notifications when a session
          ends.
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
          <li>React state & interval effects</li>
          <li>LocalStorage persistence for completed sessions</li>
          <li>Progress ring with SVG</li>
          <li>Desktop notifications</li>
        </ul>
      </div>

      {/* Progress ring */}
      <div className="relative w-48 h-48 mb-6">
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 200 200"
        >
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="currentColor"
            strokeWidth="12"
            className="text-gray-300"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="currentColor"
            strokeWidth="12"
            className="text-blue-500 transition-all duration-1000 ease-linear"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 90}
            strokeDashoffset={(1 - progress) * 2 * Math.PI * 90}
            strokeLinecap="round"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-lg font-medium">
            {mode === "work" ? "Work" : "Break"}
          </p>
          <p className="text-3xl font-mono">{formatTime(time)}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleStartPause}
          className={`px-4 py-2 rounded text-white ${
            isRunning
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Reset
        </button>
      </div>

      <div className="text-sm text-gray-700">
        Completed Sessions: <span className="font-semibold">{sessions}</span>
      </div>
    </div>
  );
}
