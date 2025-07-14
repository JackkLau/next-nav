import {MenuData} from '@/data/left-menu';
import {faHeart, faHouse, faStar} from '@fortawesome/free-solid-svg-icons';

export const topMenu: MenuData[] = [
  {
    id: '1',
    name: '首页',
    icon: faHouse,
  },
  {
    id: '2',
    name: '收藏',
    icon: faStar,
  },
  {
    id: '3',
    name: '关注我',
    icon: faHeart,
  },
  // 更多导航项...
];