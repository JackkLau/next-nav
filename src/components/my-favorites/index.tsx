import { useFavoriteSites } from '@/lib/utils';
import { navigationData } from '@/data/navigation';
import NaviItem from '@/components/navi-item';

export default function MyFavorites({ title = '我的收藏', filterCategory }: { title?: string, filterCategory?: string }) {
  const { favorites } = useFavoriteSites();
  let favoriteSites = navigationData.filter(site => favorites.includes(site.id));
  if (filterCategory) {
    favoriteSites = favoriteSites.filter(site => site.category === filterCategory);
  }
  if (favoriteSites.length === 0) return null;
  return (
    <section className="mb-6">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <NaviItem navItems={favoriteSites} title={title} />
    </section>
  );
} 