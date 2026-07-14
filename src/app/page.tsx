import { auth } from "@/auth";
import { LogOut, Activity, BarChart3, Newspaper } from "lucide-react";
import { signOut } from "@/auth";
import { StockOverview } from "@/components/StockOverview";
import { NewsFeed } from "@/components/NewsFeed";
import { Suspense } from "react";

export default async function DashboardPage() {
  const session = await auth();

  // Varsayılan takip edilen hisseler
  const defaultStocks = ["AAPL", "MSFT", "TSLA"];

  return (
    <div className="min-h-screen bg-[#0f1115] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-y-0 border-l-0 fixed h-full flex flex-col z-50">
        <div className="p-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Activity className="text-blue-500" /> Find Platform
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <BarChart3 className="w-5 h-5" /> Analizler
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <Newspaper className="w-5 h-5" /> Canlı Haberler
          </a>
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold">
              {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{session?.user?.email}</p>
              <p className="text-xs text-gray-500">Premium Üye</p>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Çıkış Yap
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 max-w-7xl">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Piyasa Özeti</h1>
            <p className="text-gray-400 mt-1">Hoş geldiniz, piyasalar şu an açık.</p>
          </div>
        </header>

        {/* Stock Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {defaultStocks.map((symbol) => (
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
      </main>
    </div>
  );
}
