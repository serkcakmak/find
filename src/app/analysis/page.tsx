import { auth } from "@/auth";
import { Sidebar } from "@/components/Sidebar";
import { TechnicalChart } from "@/components/TechnicalChart";
import { getStockCandles } from "@/lib/finnhub";
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
  const to = Math.floor(Date.now() / 1000);
  const from = to - (365 * 24 * 60 * 60);

  // Fetch data
  const rawData = await getStockCandles(symbol, "D", from, to);

  let chartData: any[] = [];
  
  if (rawData && rawData.s === "ok") {
    // Convert Finnhub format to Lightweight Charts format
    chartData = rawData.t.map((timestamp: number, index: number) => {
      // Convert unix timestamp to YYYY-MM-DD
      const date = new Date(timestamp * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return {
        time: `${year}-${month}-${day}`,
        open: rawData.o[index],
        high: rawData.h[index],
        low: rawData.l[index],
        close: rawData.c[index]
      };
    });
  }

  const popularSymbols = ["AAPL", "MSFT", "TSLA", "NVDA", "AMZN", "GOOGL"];

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex">
      <Sidebar />

      <main className="ml-64 flex-1 p-8 max-w-7xl">
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
      </main>
    </div>
  );
}
