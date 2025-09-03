"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // ✅ Next.js optimized image

interface WeatherData {
  name: string;
  main: { temp: number };
  weather: { description: string; icon: string }[];
}

interface Favorite {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export default function WeatherPage() {
  const [city, setCity] = useState("");
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Favorite[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteWeather, setFavoriteWeather] = useState<Record<string, WeatherData>>({});

  // ---------- Persistence ----------
  useEffect(() => {
    const saved = localStorage.getItem("favoriteCities");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("favoriteCities", JSON.stringify(favorites));
  }, [favorites]);

  // ---------- Fetch Weather ----------
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load weather");
      }
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
      const json: Favorite[] = await res.json();
      setSuggestions(json);
    } catch {
      console.error("Failed to fetch suggestions");
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load weather");
      }
    }
  }

  // ---------- Favorites ----------
  function addFavorite(city: Favorite) {
    if (favorites.find((f) => f.name === city.name && f.country === city.country)) return;
    setFavorites([...favorites, city]);
  }

  function removeFavorite(name: string) {
    setFavorites(favorites.filter((f) => f.name !== name));
    setFavoriteWeather((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  }

  // Load weather for all favorites (on mount or add/remove)
  useEffect(() => {
    async function loadFavorites() {
      const results: Record<string, WeatherData> = {};
      for (const fav of favorites) {
        try {
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${fav.lat}&lon=${fav.lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_KEY}&units=metric`
          );
          const json: WeatherData = await res.json();
          results[fav.name] = json;
        } catch {
          console.error("Failed to load favorite:", fav.name);
        }
      }
      setFavoriteWeather(results);
    }

    if (favorites.length) loadFavorites();
    else setFavoriteWeather({});
  }, [favorites]);

  // Refresh one favorite on demand
  async function refreshFavorite(fav: Favorite) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${fav.lat}&lon=${fav.lon}&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_KEY}&units=metric`
      );
      if (!res.ok) throw new Error("City not found");
      const json: WeatherData = await res.json();
      setFavoriteWeather((prev) => ({ ...prev, [fav.name]: json }));
    } catch {
      console.error("Failed to refresh favorite:", fav.name);
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto mt-10 mb-10 p-6 bg-gray-100 rounded-xl shadow">
      {/* Back button */}
      <div className="self-start mb-4">
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Back to Mini Apps
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">Weather Dashboard</h1>

      {/* --- About Box --- */}
      <div className="mb-6 p-4 w-full bg-blue-50 border-l-4 border-blue-400 rounded">
        <h2 className="text-lg font-semibold mb-2">About this app</h2>
        <p>
          This mini-app demonstrates real-time weather lookups with city autocomplete
          and user-managed favorites, persisted locally. It’s designed as a showcase
          of front-end engineering techniques you’d use in production.
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
          <li><strong>State & Effect hooks</strong> for async data fetching and persistence.</li>
          <li><strong>Debounced search + autocomplete</strong> powered by the OpenWeather Geo API.</li>
          <li><strong>LocalStorage persistence</strong> to keep favorite cities across refreshes.</li>
          <li><strong>Dynamic rendering</strong> of favorite city cards with refresh/remove actions.</li>
        </ul>
        <p className="mt-2 text-sm text-gray-600">
          🔮 Possible extensions: 5-day forecast, °C/°F toggle, geolocation for current position,
          and cloud sync for cross-device favorites.
        </p>
      </div>

      {/* Search box */}
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
              className="px-4 py-2 cursor-pointer hover:bg-gray-200 flex justify-between"
            >
              <span>
                {s.name}
                {s.state ? `, ${s.state}` : ""}, {s.country}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addFavorite(s);
                }}
                className="text-blue-600 text-sm hover:underline"
              >
                + Favorite
              </button>
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

      {/* Current search */}
      {data && (
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold">{data.name}</h2>
          <p className="text-lg">{data.main.temp}°C</p>
          <p className="capitalize">{data.weather[0].description}</p>
          <Image
            className="mx-auto mt-2"
            src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
            alt="weather icon"
            width={100}
            height={100}
          />
        </div>
      )}

      {/* Favorites section */}
      {favorites.length > 0 && (
        <div className="mt-8 w-full">
          <h2 className="text-lg font-semibold mb-2">Favorite Cities</h2>
          <div className="space-y-2">
            {favorites.map((fav) => {
              const w = favoriteWeather[fav.name];
              return (
                <div
                  key={fav.name}
                  className="p-4 bg-white rounded shadow flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold">{fav.name}</h3>
                    {w ? (
                      <p>
                        {w.main.temp}°C – {w.weather[0].description}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm">Loading...</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => refreshFavorite(fav)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={() => removeFavorite(fav.name)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
