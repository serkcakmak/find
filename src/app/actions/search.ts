"use server";

import YahooFinanceClass from "yahoo-finance2";
const yahooFinance = new YahooFinanceClass();

export async function searchSymbols(query: string) {
  if (!query || query.length < 2) return [];

  try {
    const result = await yahooFinance.search(query);
    // Return only equities and ETFs to avoid clutter, and limit to 5 results
    return result.quotes
      .filter((q: any) => q.isYahooFinance === true && (q.quoteType === "EQUITY" || q.quoteType === "ETF"))
      .slice(0, 5)
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchDisp || q.exchange,
      }));
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}
