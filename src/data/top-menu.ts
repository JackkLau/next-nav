import {MenuData} from '@/data/left-menu';
import {faHeart, faHouse, faStar, faPlus} from '@fortawesome/free-solid-svg-icons';

export const topMenuMapping = {
  '首页': 'home',
  '收藏': 'favorite',
  '关注我': 'follow_me',
  '提交收录': 'submit_collection',
  '发现更多有价值内容': 'more_value_content',
}

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
  {
    id: '4',
    name: '提交收录',
    icon: faPlus,
  },
  // 更多导航项...
];