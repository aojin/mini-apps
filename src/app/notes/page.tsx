"use client";
import React, { useEffect, useState } from "react";

interface Note {
  id: number;
  title: string;
  content: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("notes");
    if (saved) setNotes(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!title.trim() || !content.trim()) return;
    const newNote: Note = { id: Date.now(), title, content };
    setNotes((prev) => [...prev, newNote]);
    setTitle("");
    setContent("");
  };

  const deleteNote = (id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto mt-10 p-6 bg-gray-50 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Notes App</h1>

      <div className="mb-6 p-4 w-full bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <h2 className="text-lg font-semibold mb-2">About this app</h2>
        <p>
            A lightweight notes app where you can create and delete notes with titles
            and content. Notes persist across refreshes using <code>localStorage</code>.
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
            <li>React controlled inputs</li>
            <li>useEffect for localStorage persistence</li>
            <li>Dynamic rendering of note list with delete handlers</li>
        </ul>
        <p className="mt-2 text-sm text-gray-600">
            🔮 Possible features: edit notes, tags/categories, sync with a backend DB.
        </p>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="w-full px-4 py-2 border rounded mb-2"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Note content"
        className="w-full px-4 py-2 border rounded mb-2"
      />
      <button
        onClick={addNote}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Add Note
      </button>

      <div className="w-full mt-6 space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="p-4 bg-white border rounded shadow flex flex-col"
          >
            <h3 className="font-semibold">{note.title}</h3>
            <p className="text-gray-700">{note.content}</p>
            <button
              onClick={() => deleteNote(note.id)}
              className="mt-2 self-start px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
