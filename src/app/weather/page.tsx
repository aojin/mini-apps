"use client";
import React, { useState } from "react";

interface WeatherData {
  name: string;
  main: { temp: number };
  weather: { description: string; icon: string }[];
}

export default function WeatherPage() {
  const [city, setCity] = useState("");
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{ name: string; state?: string; country: string; lat: number; lon: number }[]>([]);

  async function fetchWeather() {
    setError(null);
    setData(null);

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_KEY}&units=metric`
      );
      if (!res.ok) throw new Error("City not found");
      const json: WeatherData = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function fetchSuggestions(query: string) {
    if (!query) {
        setSuggestions([]);
        return;
    }

    try {
        const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_KEY}`
        );
        if (!res.ok) throw new Error("Failed to fetch suggestions");
        const json = await res.json();
        setSuggestions(json);
    } catch (err) {
        console.error(err);
    }
  }

  async function fetchWeatherByCoords(lat: number, lon: number) {
    setError(null);
    setData(null);

    try {
        const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_KEY}&units=metric`
        );
        if (!res.ok) throw new Error("City not found");
        const json: WeatherData = await res.json();
        setData(json);
    } catch (err: any) {
        setError(err.message);
    }
  }


  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto mt-10 p-6 bg-gray-100 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Weather Dashboard</h1>

      <div className="mb-6 p-4 w-full bg-blue-50 border-l-4 border-blue-400 rounded">
        <h2 className="text-lg font-semibold mb-2">About this app</h2>
        <p>
            A simple weather dashboard that lets you search for cities and view
            real-time conditions. Uses the OpenWeather API with geo lookup for
            autocomplete.
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
            <li>React state & effect hooks for API calls</li>
            <li>Client-side environment variables with <code>NEXT_PUBLIC_</code></li>
            <li>Dynamic autocomplete using OpenWeather’s Geo API</li>
        </ul>
        <p className="mt-2 text-sm text-gray-600">
            🔮 Possible features: 5-day forecast, unit toggle (°C/°F),
            “favorite cities” saved to localStorage.
        </p>
      </div>

      <input
        value={city}
        onChange={(e) => {
            const value = e.target.value;
            setCity(value);
            fetchSuggestions(value);
        }}
        placeholder="Enter a city..."
        className="w-full px-4 py-2 border rounded mb-2"
      />

      {suggestions.length > 0 && (
        <ul className="w-full bg-white border rounded shadow mt-1">
            {suggestions.map((s, idx) => (
            <li
                key={idx}
                onClick={() => {
                    setCity(s.name);
                    setSuggestions([]);
                    fetchWeatherByCoords(s.lat, s.lon);
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                >
                {s.name}
                {s.state ? `, ${s.state}` : ""}, {s.country}
            </li>
            ))}
        </ul>
        )}

      <button
        onClick={fetchWeather}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Get Weather
      </button>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {data && (
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold">{data.name}</h2>
          <p className="text-lg">{data.main.temp}°C</p>
          <p className="capitalize">{data.weather[0].description}</p>
          <img
            className="mx-auto mt-2"
            src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
            alt="weather icon"
          />
        </div>
      )}
    </div>
  );
}
