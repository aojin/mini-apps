"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function CryptoPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  async function fetchCoins() {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false"
      );
      if (!res.ok) throw new Error("Failed to fetch coins");
      const data: Coin[] = await res.json();
      setCoins(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, 30000);
    return () => clearInterval(interval);
  }, []);

  const filtered = coins.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto mt-10 mb-10 p-6 bg-gray-50 rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Crypto Price Tracker</h1>

      {/* Back navigation */}
      <Link
        href="/"
        className="mb-6 self-start px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back to Mini Apps
      </Link>

      {/* About box */}
      <div className="mb-6 p-4 w-full bg-green-50 border-l-4 border-green-400 rounded">
        <h2 className="text-lg font-semibold mb-2">About this app</h2>
        <p>
          A real-time crypto price tracker that pulls live data from the
          CoinGecko API, refreshing every 30 seconds with search filtering.
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-700">
          <li>API fetching with useEffect and auto-refresh</li>
          <li>Search filter for dynamic client-side filtering</li>
          <li>Conditional styling for price movement</li>
        </ul>
        <p className="mt-2 text-sm text-gray-600">
          🔮 Possible features: historical charts, sorting by market cap,
          favorites watchlist.
        </p>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for a coin..."
        className="w-full px-4 py-2 border rounded mb-4"
      />

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((coin) => (
          <div
            key={coin.id}
            className="flex items-center p-4 bg-white rounded shadow"
          >
            <Image
              src={coin.image}
              alt={coin.name}
              width={40}
              height={40}
              className="w-10 h-10 mr-4"
            />
            <div className="flex-1">
              <h3 className="font-semibold">
                {coin.name} ({coin.symbol.toUpperCase()})
              </h3>
              <p>${coin.current_price.toLocaleString()}</p>
              <p
                className={`text-sm ${
                  coin.price_change_percentage_24h >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {coin.price_change_percentage_24h.toFixed(2)}% (24h)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
