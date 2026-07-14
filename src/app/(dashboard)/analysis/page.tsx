import { auth } from "@/auth";
import { TechnicalChart } from "@/components/TechnicalChart";
import { getStockCandles } from "@/lib/yahoo-finance";
import { Activity } from "lucide-react";
import Link from "next/link";

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: { symbol?: string };
}) {
  const session = await auth();
  
  // Await searchParams before using its properties in Next.js 16+
  const params = await searchParams;
  const symbol = params?.symbol || "AAPL";

  // Calculate timestamps for the last 1 year
  const to = new Date();
  const from = new Date();
  from.setFullYear(to.getFullYear() - 1);

  // Fetch data
  const rawData = await getStockCandles(symbol, from, to);

  let chartData: any[] = [];
  
  if (rawData && rawData.length > 0) {
    // Convert Yahoo Finance format to Lightweight Charts format
    chartData = rawData.map((item: any) => {
      // YF item.date is a Date object
      const date = new Date(item.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return {
        time: `${year}-${month}-${day}`,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close
      };
    });
  }

  const popularSymbols = ["AAPL", "MSFT", "TSLA", "NVDA", "AMZN", "GOOGL"];

  return (
    <>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teknik Analiz</h1>
          <p className="text-gray-400 mt-1">Gelişmiş mum grafikleri ve piyasa göstergeleri.</p>
        </div>
      </header>

      {/* Symbol Selector */}
      <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
        {popularSymbols.map((s) => (
          <Link 
            key={s} 
            href={`/analysis?symbol=${s}`}
            className={`px-4 py-2 rounded-xl border transition-colors ${
              symbol === s 
                ? "bg-blue-500/20 border-blue-500/50 text-blue-400" 
                : "glass border-white/10 text-gray-300 hover:bg-white/5"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {chartData.length > 0 ? (
        <TechnicalChart data={chartData} symbol={symbol} />
      ) : (
        <div className="glass rounded-2xl p-6 h-[500px] flex flex-col items-center justify-center text-gray-500">
          <Activity className="w-12 h-12 mb-4 animate-pulse opacity-50" />
          <p className="text-lg">Grafik verisi yüklenemedi veya bulunamadı.</p>
          <p className="text-sm mt-2">API kotası dolmuş olabilir veya geçersiz bir sembol girdiniz.</p>
        </div>
      )}
    </>
  );
}
