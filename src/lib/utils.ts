'use client'
import { useState, useEffect } from 'react';

// 分类名称到英文标识符的映射
const categoryToSlug: { [key: string]: string } = {
  '常用网站': 'common',
  '优质社区': 'community',
  '实用工具': 'tools',
  '远程机会': 'remote',
  '个人网站': 'personal',
  '资源收藏': 'resources',
  '镜像站': 'mirror',
  '导航发现': 'navigation',
  '影视娱乐': 'entertainment',
}

/**
 * 将中文分类名称转换为英文标识符
 * @param categoryName 中文分类名称
 * @returns 英文标识符
 */
export function getCategorySlug(categoryName: string): string {
  return categoryToSlug[categoryName] || categoryName
}

const FAVORITE_KEY = 'favoriteSites';

export function getFavoriteSites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITE_KEY) || '[]');
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
