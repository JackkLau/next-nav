// data/navigation.ts
export interface NavigationItem {
  id: string;
  name: string;
  url: string;
  category: '工具' | '学习' | '娱乐' | '社交' | '其他';
  favorite: boolean;
  description?: string;
}

export const navigationData: NavigationItem[] = [
  {
    id: '1',
    name: 'GitHub',
    url: 'https://github.com',
    category: '工具',
    favorite: true,
    description: '全球最大的代码托管平台'
  },
  {
    id: '2',
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    category: '学习',
    favorite: true,
    description: '权威的Web技术文档'
  },
  // 更多导航项...
];