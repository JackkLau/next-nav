'use client';
import { useFavoriteSites } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-regular-svg-icons';

export default function FavoriteButton({ id }: { id: string }) {
  const { favorites, toggleFavorite } = useFavoriteSites();
  const isFav = favorites.includes(id);
  return (
    <button
      className={`ml-2 text-yellow-400 ${isFav ? '' : 'opacity-30'}`}
      onClick={() => toggleFavorite(id)}
      aria-label={isFav ? '取消收藏' : '收藏'}
      type="button"
    >
      <FontAwesomeIcon icon={isFav ? faStarSolid : faStar} className="w-4 h-4" />
      {isFav ? '已收藏' : '收藏'}
    </button>
  );
} 