import { auth } from "@/auth";
import { Activity } from "lucide-react";
import { StockOverview } from "@/components/StockOverview";
import { NewsFeed } from "@/components/NewsFeed";
import { Suspense } from "react";
import { getFavorites } from "@/app/actions/favorites";

export default async function DashboardPage() {
  const session = await auth();

  // Varsayılan takip edilen hisseler
  let displayStocks = ["AAPL", "MSFT", "TSLA"];

  if (session?.user) {
    const favorites = await getFavorites();
    if (favorites.length > 0) {
      displayStocks = favorites;
    }
  }

  return (
    <>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Piyasa Özeti</h1>
          <p className="text-gray-400 mt-1">Hoş geldiniz, piyasalar şu an açık.</p>
        </div>
      </header>

      {/* Stock Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {displayStocks.map((symbol) => (
          <Suspense 
            key={symbol}
            fallback={
              <div className="glass p-6 rounded-2xl flex flex-col justify-center animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded mb-4" />
                <div className="h-8 w-32 bg-white/10 rounded mb-2" />
                <div className="h-4 w-16 bg-white/10 rounded" />
              </div>
            }
          >
            <StockOverview symbol={symbol} />
          </Suspense>
        ))}
      </div>

      {/* News Feed Section */}
      <div className="grid grid-cols-1 gap-6">
        <Suspense fallback={
          <div className="glass rounded-2xl p-6 h-96 flex items-center justify-center">
            <p className="text-gray-500 flex items-center gap-2">
              <Activity className="animate-pulse" /> Haberler yükleniyor...
            </p>
          </div>
        }>
          <NewsFeed />
        </Suspense>
      </div>
    </>
  );
}
