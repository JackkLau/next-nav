'use client';
import { useFavoriteSites } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { useTranslations } from 'next-intl'

export default function FavoriteButton({ id }: { id: string }) {
  const t = useTranslations()
  const { favorites, toggleFavorite } = useFavoriteSites();
  const isFav = favorites.includes(id);
  return (
    <button
      className={`ml-2 text-yellow-400 ${isFav ? '' : 'opacity-30'}`}
      onClick={() => toggleFavorite(id)}
      aria-label={isFav ? t('cancel_favorite') : t('add_favorite')}
      type="button"
    >
      <FontAwesomeIcon icon={isFav ? faStarSolid : faStar} className="w-8 h-8" />
      <span className="hidden text-sm">{isFav ? t('favorite_button.cancel_favorite') : t('favorite_button.add_favorite')}</span>
    </button>
  );
} 