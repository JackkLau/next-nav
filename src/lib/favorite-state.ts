export interface FavoriteToggleResult {
  ids: string[]
  isFavorite: boolean
}

export function toggleFavoriteId(
  favoriteIds: readonly string[],
  id: string,
): FavoriteToggleResult {
  if (favoriteIds.includes(id)) {
    return {
      ids: favoriteIds.filter((favoriteId) => favoriteId !== id),
      isFavorite: false,
    }
  }

  return {
    ids: [...favoriteIds, id],
    isFavorite: true,
  }
}
