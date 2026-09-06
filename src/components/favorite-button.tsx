'use client';
import { useFavoriteSites } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { useTranslations } from 'next-intl'
import { toast } from 'sonner';

export default function FavoriteButton({ id }: { id: string }) {
  const t = useTranslations()
  const { favorites, toggleFavorite } = useFavoriteSites();
  const isFav = favorites.includes(id);
  return (
    <button
      className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${isFav ? 'bg-amber-50 text-amber-400' : 'bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-400'}`}
      onClick={() => {
        const isFavorite = toggleFavorite(id);
        toast(isFavorite
          ? t('favorites.added', {name: id})
          : t('favorites.removed', {name: id}));
      }}
      aria-label={isFav ? t('cancel_favorite') : t('add_favorite')}
      aria-pressed={isFav}
      type="button"
    >
      <FontAwesomeIcon icon={isFav ? faStarSolid : faStar} className="size-4" />
      <span className="hidden text-sm">{isFav ? t('favorite_button.cancel_favorite') : t('favorite_button.add_favorite')}</span>
    </button>
  );
}
