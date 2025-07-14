'use client';
import MyFavorites from '.';

interface MyFavoritesProps {
  title: string;
  filterCategory?: string;
}

export default function MyFavoritesClient(props: MyFavoritesProps) {
  return <MyFavorites {...props} />;
} 