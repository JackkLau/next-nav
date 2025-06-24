import {navigationData } from '@/data/navigation';

export interface MenuData {
  id: string;
  name: string;
}

// 过滤数据，只保留 category，并且去除重复的 category
export const categories = [...new Set(navigationData.map(item => item.category))];
export const leftMenu: MenuData[] = categories.map((item, index) => ({
  id: String(index),
  name: item,
}));