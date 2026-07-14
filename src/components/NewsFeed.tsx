import { ExternalLink, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";
import prisma from "@/lib/prisma";

export async function NewsFeed() {
  // Fetch latest 50 news from database
  const news = await prisma.news.findMany({
    orderBy: { datetime: 'desc' },
    take: 50
  });

  if (!news || news.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 h-96 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-2">Haberler henüz işlenmedi.</p>
        <p className="text-sm text-gray-600">Arka planda haber botu (Cron) bekleniyor...</p>
      </div>
    );
  }

  const getSentimentIcon = (sentiment: string) => {
    switch(sentiment?.toLowerCase()) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'bearish': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSentimentText = (sentiment: string) => {
    switch(sentiment?.toLowerCase()) {
      case 'bullish': return <span className="text-green-500 font-medium">Yükseliş (Bullish)</span>;
      case 'bearish': return <span className="text-red-500 font-medium">Düşüş (Bearish)</span>;
      default: return <span className="text-gray-400 font-medium">Nötr</span>;
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col h-[600px]">
      <div className="p-6 border-b border-white/5 bg-white/5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Yapay Zeka Haber Analizi
        </h2>
      </div>
      
      <div className="overflow-y-auto flex-1 p-6 space-y-6">
        {news.map((item) => (
          <a 
            key={item.id} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group block bg-white/[0.02] hover:bg-white/[0.05] p-4 rounded-xl transition-colors border border-white/5"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {item.image && (
                <div className="w-full sm:w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-gray-800">
                  <img 
                    src={item.image} 
                    alt={item.headline} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md font-medium">
                    {item.source}
                  </span>
                  <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                    <Clock className="w-3 h-3" />
                    {new Date(item.datetime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {item.relatedTickers && item.relatedTickers.length > 0 && (
                    <span className="flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-md">
                      İlgili: {item.relatedTickers.join(", ")}
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                    {getSentimentIcon(item.sentiment)}
                    {getSentimentText(item.sentiment)}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                  {item.headline}
                </h3>
                <p className="text-sm text-gray-400 mt-2 line-clamp-3">
                  {item.summary}
                </p>
              </div>
              <div className="shrink-0 hidden sm:flex items-center">
                <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
