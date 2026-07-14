export async function getMarketNews() {
  const apiToken = process.env.MARKETAUX_API_TOKEN || "me8wIVPKv50vS0YyV98x9Ww0V4JnF6RUdEuIR16u";
  // Fetch general news, language=en
  const url = `https://api.marketaux.com/v1/news/all?language=en&limit=3&api_token=${apiToken}`;
  
  try {
    const res = await fetch(url, { next: { revalidate: 300 } }); // Cache for 5 minutes
    if (!res.ok) {
      console.error("MarketAux API Error:", res.status, res.statusText);
      return [];
    }
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("MarketAux Fetch Error:", error);
    return [];
  }
}
