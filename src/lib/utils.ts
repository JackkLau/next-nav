'use client'
import { useState, useEffect } from 'react';
import { CategoryMapping, legacyIdToSlug } from '@/data/navigation';

/** Returns the stable category slug used by routes and data records. */
export function getCategorySlug(categoryName: string): string {
  return CategoryMapping[categoryName] || categoryName 
}

const FAVORITE_KEY = 'favoriteSites';

export function getFavoriteSites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const savedIds = JSON.parse(localStorage.getItem(FAVORITE_KEY) || '[]');
    if (!Array.isArray(savedIds)) return [];
    return savedIds.map((id) => legacyIdToSlug[String(id)] || String(id));
  } catch {
    return [];
  }
}

export function setFavoriteSites(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FAVORITE_KEY, JSON.stringify(ids));
}

export function useFavoriteSites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavoriteSites());
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      let next;
      if (prev.includes(id)) {
        next = prev.filter(f => f !== id);
      } else {
        next = [...prev, id];
      }
      setFavoriteSites(next);
      return next;
    });
  };

  return { favorites, toggleFavorite };
}
