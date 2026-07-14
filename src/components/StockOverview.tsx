import { getStockQuote } from "@/lib/finnhub";
import { TrendingUp, TrendingDown } from "lucide-react";

export async function StockOverview({ symbol }: { symbol: string }) {
  const quote = await getStockQuote(symbol);

  if (!quote || quote.c === 0) {
    return (
      <div className="glass p-6 rounded-2xl flex flex-col justify-center animate-pulse">
        <div className="h-4 w-24 bg-white/10 rounded mb-4" />
        <div className="h-8 w-32 bg-white/10 rounded mb-2" />
        <div className="h-4 w-16 bg-white/10 rounded" />
      </div>
    );
  }

  const isPositive = quote.d >= 0;

  return (
    <div className="glass p-6 rounded-2xl relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div>
          <h3 className="text-xl font-bold tracking-tight">{symbol}</h3>
          <p className="text-sm text-gray-400">Piyasa Fiyatı</p>
        </div>
        <div className={`p-2 rounded-xl ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        </div>
      </div>
      
      <div className="relative z-10 mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">${quote.c?.toFixed(2)}</span>
          <span className={`text-sm font-medium px-2 py-0.5 rounded-md ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isPositive ? '+' : ''}{quote.d?.toFixed(2)} ({quote.dp?.toFixed(2)}%)
          </span>
        </div>
        <div className="flex gap-4 mt-4 text-xs text-gray-500">
          <div>
            <span className="block mb-1">En Yüksek</span>
            <span className="text-gray-300">${quote.h?.toFixed(2)}</span>
          </div>
          <div>
            <span className="block mb-1">En Düşük</span>
            <span className="text-gray-300">${quote.l?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
