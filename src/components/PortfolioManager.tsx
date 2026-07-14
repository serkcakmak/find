"use client";

import { useState, useEffect } from "react";
import { addPortfolioItem, deletePortfolioItem } from "@/app/actions/portfolio";
import { getQuotes } from "@/app/actions/quote";
import { Trash2, Plus, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

type PortfolioItem = {
  id: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
};

export function PortfolioManager({ initialItems }: { initialItems: PortfolioItem[] }) {
  const [items, setItems] = useState<PortfolioItem[]>(initialItems);
  const [quotes, setQuotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Form states
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Load quotes on mount and when items change
  const fetchQuotes = async () => {
    if (items.length === 0) return;
    setLoading(true);
    const symbols = Array.from(new Set(items.map(i => i.symbol)));
    const fetchedQuotes = await getQuotes(symbols);
    setQuotes(fetchedQuotes);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, [items]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !quantity || !price) return;
    setIsAdding(true);
    await addPortfolioItem(symbol, parseFloat(quantity), parseFloat(price));
    // Since revalidatePath is called in Server Action, we need to refresh the page to get the updated items.
    window.location.reload(); 
    // Ideally we would use React 18 useTransition, but reload is fine for simplicity here.
  };

  const handleDelete = async (id: string) => {
    await deletePortfolioItem(id);
    window.location.reload();
  };

  // Calculate totals
  const totalCost = items.reduce((acc, item) => acc + (item.quantity * item.averagePrice), 0);
  const currentValue = items.reduce((acc, item) => {
    const currentPrice = quotes[item.symbol] || item.averagePrice;
    return acc + (item.quantity * currentPrice);
  }, 0);
  
  const totalProfitLoss = currentValue - totalCost;
  const totalProfitLossPercentage = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6">
          <p className="text-gray-400 text-sm font-medium">Toplam Yatırım (Maliyet)</p>
          <p className="text-3xl font-bold mt-2">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <p className="text-gray-400 text-sm font-medium">Güncel Değer</p>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-3xl font-bold">${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            {loading && <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />}
          </div>
        </div>
        <div className={`glass rounded-2xl p-6 border ${totalProfitLoss >= 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
          <p className="text-gray-400 text-sm font-medium">Toplam Kâr / Zarar</p>
          <div className={`flex items-center gap-2 mt-2 ${totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalProfitLoss >= 0 ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
            <div>
              <p className="text-2xl font-bold">${Math.abs(totalProfitLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-sm font-medium">({totalProfitLossPercentage >= 0 ? '+' : ''}{totalProfitLossPercentage.toFixed(2)}%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Item Form */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Portföye Ekle</h2>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-400 mb-1">Sembol (Örn: AAPL)</label>
            <input 
              type="text" 
              value={symbol} 
              onChange={e => setSymbol(e.target.value.toUpperCase())}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-400 mb-1">Adet (Lot)</label>
            <input 
              type="number" 
              step="any"
              value={quantity} 
              onChange={e => setQuantity(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-400 mb-1">Ortalama Alış Fiyatı ($)</label>
            <input 
              type="number" 
              step="any"
              value={price} 
              onChange={e => setPrice(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <button 
            type="submit" 
            disabled={isAdding}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {isAdding ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Ekle
          </button>
        </form>
      </div>

      {/* Portfolio Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 font-medium text-gray-400">Sembol</th>
                <th className="p-4 font-medium text-gray-400">Adet</th>
                <th className="p-4 font-medium text-gray-400">Ort. Maliyet</th>
                <th className="p-4 font-medium text-gray-400">Güncel Fiyat</th>
                <th className="p-4 font-medium text-gray-400">Toplam Değer</th>
                <th className="p-4 font-medium text-gray-400">Kâr / Zarar</th>
                <th className="p-4 font-medium text-gray-400 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Portföyünüzde henüz hisse senedi bulunmuyor.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const currentPrice = quotes[item.symbol];
                  const isLoadingPrice = currentPrice === undefined;
                  const itemValue = currentPrice ? item.quantity * currentPrice : item.quantity * item.averagePrice;
                  const itemCost = item.quantity * item.averagePrice;
                  const profitLoss = itemValue - itemCost;
                  const profitLossPercentage = (profitLoss / itemCost) * 100;

                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-blue-400">{item.symbol}</td>
                      <td className="p-4 text-gray-300">{item.quantity}</td>
                      <td className="p-4 text-gray-300">${item.averagePrice.toFixed(2)}</td>
                      <td className="p-4 text-gray-300">
                        {isLoadingPrice ? <span className="animate-pulse">...</span> : `$${currentPrice.toFixed(2)}`}
                      </td>
                      <td className="p-4 font-medium text-white">${itemValue.toFixed(2)}</td>
                      <td className={`p-4 font-medium ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)} ({profitLossPercentage >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%)
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
