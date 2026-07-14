import yahooFinance from 'yahoo-finance2';

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
