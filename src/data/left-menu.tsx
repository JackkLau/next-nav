import {navigationData} from '@/data/navigation';
import {
  faBook,
  faBoxArchive,
  faCamera,
  faClone,
  faCompass,
  faPeopleGroup,
  faPersonChalkboard,
  faScrewdriverWrench,
  faGamepad
} from '@fortawesome/free-solid-svg-icons';
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';

export interface MenuData {
  id: string;
  name: string;
  icon: IconDefinition;
}

export const CategoryIconMap: {[key: string]: IconDefinition} = {
  '常用网站': faBook,
  '优质社区': faPeopleGroup,
  '实用工具': faScrewdriverWrench,
  '远程机会': faPersonChalkboard,
  '个人网站': faPersonChalkboard,
  '资源收藏': faBoxArchive,
  '镜像站': faClone,
  '导航发现': faCompass,
  '影视娱乐': faCamera,
  '游戏': faGamepad,
}

// 过滤数据，只保留 category，并且去除重复的 category
export const categories = [...new Set(navigationData.map(item => item.category))];
export const leftMenu: MenuData[] = categories.map((item, index) => ({
  id: String(index),
  name: item,
  icon: CategoryIconMap[item],
}));