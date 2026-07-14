export async function getStockQuote(symbol: string) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`;
  
  const res = await fetch(url, { next: { revalidate: 60 } }); // Cache for 60 seconds
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export async function getMarketNews() {
  const url = `https://finnhub.io/api/v1/news?category=general&token=${process.env.FINNHUB_API_KEY}`;
  
  const res = await fetch(url, { next: { revalidate: 300 } }); // Cache for 5 minutes
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return data.slice(0, 50); // Return top 50 news items
}
