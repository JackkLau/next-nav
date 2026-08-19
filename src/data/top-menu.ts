import {MenuData} from '@/data/left-menu';
import {faHeart, faHouse, faStar, faPlus} from '@fortawesome/free-solid-svg-icons';

export const topMenuMapping = {
  home: 'home',
  favorite: 'favorite',
  follow_me: 'follow_me',
  submit_collection: 'submit_collection',
  more_value_content: 'more_value_content',
}

export const topMenu: MenuData[] = [
  {
    id: '1',
    name: 'home',
    icon: faHouse,
  },
  {
    id: '2',
    name: 'favorite',
    icon: faStar,
  },
  {
    id: '3',
    name: 'follow_me',
    icon: faHeart,
  },
  {
    id: '4',
    name: 'submit_collection',
    icon: faPlus,
  },
  // 更多导航项...
];
