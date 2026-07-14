"use server";

import YahooFinanceClass from "yahoo-finance2";
const yahooFinance = new YahooFinanceClass();

export async function getQuotes(symbols: string[]) {
  if (!symbols || symbols.length === 0) return {};
  
  try {
    const results = await yahooFinance.quote(symbols);
    const quotesMap: Record<string, number> = {};
    for (const r of results) {
      quotesMap[r.symbol] = r.regularMarketPrice || r.postMarketPrice || 0;
    }
    return quotesMap;
  } catch (error) {
    console.error("Quote fetching error:", error);
    return {};
  }
}
