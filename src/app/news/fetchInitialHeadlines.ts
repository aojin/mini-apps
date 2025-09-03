// app/news/fetchInitialHeadlines.ts
export interface Article {
  title: string;
  link: string;
  source_id: string;
}

export interface InitialData {
  results: Article[];
  nextPage: string | null;
  error?: string; // optional error message for UI
}

let lastGoodData: Article[] = []; // simple in-memory cache

export async function fetchInitialHeadlines(): Promise<InitialData> {
  try {
    const res = await fetch(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWS_API_KEY}&country=us&language=en&category=top`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      if (res.status === 429) {
        console.warn("Rate limited. Serving cached data if available.");
        return {
          results: lastGoodData,
          nextPage: null,
          error: "⚠️ Rate limit reached. Showing cached results.",
        };
      }
      throw new Error(`Failed to fetch headlines (status ${res.status})`);
    }

    const data = await res.json();
    lastGoodData = data.results || []; // update cache

    return {
      results: data.results || [],
      nextPage: data.nextPage || null,
    };
  } catch (err: any) {
    console.error("fetchInitialHeadlines error:", err);
    return {
      results: lastGoodData,
      nextPage: null,
      error: err.message || "Unexpected error",
    };
  }
}
