export async function getMarketNews() {
  const apiKey = process.env.POLYGON_API_KEY || "1529qk3TikwktLKlcD3rqRHbzLBVJi3O";
  const url = `https://api.polygon.io/v2/reference/news?limit=50&apiKey=${apiKey}`;
  
  try {
    const res = await fetch(url, { next: { revalidate: 300 } }); // Cache for 5 minutes
    if (!res.ok) {
      console.error("Polygon API Error:", res.status, res.statusText);
      return [];
    }
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Polygon Fetch Error:", error);
    return [];
  }
}
