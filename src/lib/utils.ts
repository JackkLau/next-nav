'use client'
import { useSyncExternalStore } from 'react';
import { CategoryMapping, legacyIdToSlug } from '@/data/navigation';

/** Returns the stable category slug used by routes and data records. */
export function getCategorySlug(categoryName: string): string {
  return CategoryMapping[categoryName] || categoryName 
}

const FAVORITE_KEY = 'favoriteSites';
const FAVORITES_CHANGED_EVENT = 'favorite-sites-changed';
const EMPTY_FAVORITES: string[] = [];

let cachedFavoritesJson: string | undefined;
let cachedFavorites: string[] = EMPTY_FAVORITES;

export function getFavoriteSites(): string[] {
  if (typeof window === 'undefined') return EMPTY_FAVORITES;

  const savedFavoritesJson = localStorage.getItem(FAVORITE_KEY) || '[]';
  if (savedFavoritesJson === cachedFavoritesJson) return cachedFavorites;

  try {
    const savedIds = JSON.parse(savedFavoritesJson);
    cachedFavorites = Array.isArray(savedIds)
      ? savedIds.map((id) => legacyIdToSlug[String(id)] || String(id))
      : EMPTY_FAVORITES;
  } catch {
    cachedFavorites = EMPTY_FAVORITES;
  }

  cachedFavoritesJson = savedFavoritesJson;
  return cachedFavorites;
}

export function setFavoriteSites(ids: string[]) {
  if (typeof window === 'undefined') return;

  cachedFavorites = [...ids];
  cachedFavoritesJson = JSON.stringify(cachedFavorites);
  localStorage.setItem(FAVORITE_KEY, cachedFavoritesJson);
  window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
}

function subscribeToFavoriteSites(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key !== FAVORITE_KEY && event.key !== null) return;
    cachedFavoritesJson = undefined;
    onStoreChange();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(FAVORITES_CHANGED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(FAVORITES_CHANGED_EVENT, onStoreChange);
  };
}

export function useFavoriteSites() {
  const favorites = useSyncExternalStore(
    subscribeToFavoriteSites,
    getFavoriteSites,
    () => EMPTY_FAVORITES,
  );

  const toggleFavorite = (id: string) => {
    const currentFavorites = getFavoriteSites();
    const nextFavorites = currentFavorites.includes(id)
      ? currentFavorites.filter((favoriteId) => favoriteId !== id)
      : [...currentFavorites, id];
    setFavoriteSites(nextFavorites);
  };

  return { favorites, toggleFavorite };
}
