// app/news/fetchInitialHeadlines.ts
export interface Article {
  title: string;
  link: string;
  source_id: string;
}

export interface InitialData {
  results: Article[];
  nextPage: string | null;
}

export async function fetchInitialHeadlines(): Promise<InitialData> {
  const res = await fetch(
    `https://newsdata.io/api/1/news?apikey=${process.env.NEWS_API_KEY}&country=us&language=en&category=top`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("Failed to fetch headlines");

  const data = await res.json();
  return {
    results: data.results,
    nextPage: data.nextPage || null,
  };
}
