"use client";

import { Heart } from "lucide-react";
import { toggleFavorite } from "@/app/actions/favorites";
import { useState } from "react";

export function FavoriteButton({ symbol, isFavorited: initialFavorited }: { symbol: string, isFavorited: boolean }) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    // Optimistic UI update
    setIsFavorited(!isFavorited);
    try {
      await toggleFavorite(symbol);
    } catch (e) {
      // Revert on error
      setIsFavorited(isFavorited);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isLoading}
      className={`p-2 rounded-full transition-colors flex items-center justify-center ${
        isFavorited 
          ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" 
          : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
      }`}
      title={isFavorited ? "Favorilerden Çıkar" : "Favorilere Ekle"}
    >
      <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
    </button>
  );
}
