"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, TrendingUp } from "lucide-react";
import { searchSymbols } from "@/app/actions/search";

export function SymbolSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        const res = await searchSymbols(query);
        setResults(res);
        setIsLoading(false);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (symbol: string) => {
    setQuery("");
    setIsOpen(false);
    router.push(`/analysis?symbol=${symbol}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim().length > 0) {
      handleSelect(query.toUpperCase().trim());
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Hisse sembolü veya şirket adı arayın... (Örn: AMZN)"
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          <ul className="py-2">
            {results.map((item) => (
              <li key={item.symbol}>
                <button
                  onClick={() => handleSelect(item.symbol)}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 flex flex-col transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-400 group-hover:text-blue-300">
                      {item.symbol}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
                      {item.exchange}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400 truncate mt-1">
                    {item.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isOpen && results.length === 0 && query.length >= 2 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1d24] border border-white/10 rounded-xl shadow-2xl p-4 text-center text-gray-400 z-50">
          Sonuç bulunamadı.
        </div>
      )}
    </div>
  );
}
