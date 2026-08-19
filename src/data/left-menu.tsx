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
import type {FontAwesomeIconProps} from '@fortawesome/react-fontawesome';

type IconDefinition = FontAwesomeIconProps['icon'];

export interface MenuData {
  id: string;
  name: string;
  icon: IconDefinition;
}

export const CategoryIconMap: {[key: string]: IconDefinition} = {
  common: faBook,
  community: faPeopleGroup,
  tools: faScrewdriverWrench,
  remote: faPersonChalkboard,
  personal: faPersonChalkboard,
  resources: faBoxArchive,
  mirror: faClone,
  navigation: faCompass,
  entertainment: faCamera,
  game: faGamepad,
}

// 过滤数据，只保留 category，并且去除重复的 category
export const categories = [...new Set(navigationData.map(item => item.category))];
export const leftMenu: MenuData[] = categories.map((item, index) => ({
  id: String(index),
  name: item,
  icon: CategoryIconMap[item],
}));
