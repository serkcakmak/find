import { getMarketNews } from "@/lib/finnhub";
import { ExternalLink, Clock } from "lucide-react";

export async function NewsFeed() {
  const news = await getMarketNews();

  if (!news || news.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 h-96 flex items-center justify-center">
        <p className="text-gray-500">Haberler yüklenemedi.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col h-[600px]">
      <div className="p-6 border-b border-white/5 bg-white/5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Canlı Piyasa Haberleri
        </h2>
      </div>
      
      <div className="overflow-y-auto flex-1 p-6 space-y-6">
        {news.map((item: any) => (
          <a 
            key={item.id} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="flex gap-4">
              {item.image && (
                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-800">
                  <img 
                    src={item.image} 
                    alt={item.headline} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md font-medium">
                    {item.source}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.datetime * 1000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-200 group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                  {item.headline}
                </h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {item.summary}
                </p>
              </div>
              <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4 text-blue-400" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
