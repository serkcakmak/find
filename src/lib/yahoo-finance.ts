import YahooFinanceClass from 'yahoo-finance2';

const yahooFinance = new YahooFinanceClass();
export async function getStockCandles(symbol: string, from: Date, to: Date): Promise<any[] | null> {
  try {
    const queryOptions = { 
      period1: from, 
      period2: to, 
      interval: '1d' as const 
    };
    
    // YF returns an array of { date, open, high, low, close, volume, adjClose }
    const result = await yahooFinance.historical(symbol, queryOptions);
    
    return result;
  } catch (error) {
    console.error("Yahoo Finance fetching error:", error);
    return null;
  }
}

export async function getMarketNews() {
  try {
    const results = await yahooFinance.search('markets');
    if (!results || !results.news) return [];
    
    return results.news.map((item: any) => ({
      id: item.uuid,
      url: item.link,
      image: item.thumbnail?.resolutions?.[0]?.url || "",
      source: item.publisher,
      datetime: new Date(item.providerPublishTime).getTime() / 1000,
      headline: item.title,
      summary: "",
      relatedTickers: item.relatedTickers || [],
    }));
  } catch (error) {
    console.error("Yahoo Finance News Error:", error);
    return [];
  }
}
