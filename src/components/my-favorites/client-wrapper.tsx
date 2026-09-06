'use client';
import MyFavorites from '.';
import type { NavigationItem } from '@/data/navigation';

interface MyFavoritesProps {
  navItems: NavigationItem[];
}

export default function MyFavoritesClient(props: MyFavoritesProps) {
  return <MyFavorites {...props} />;
} 
