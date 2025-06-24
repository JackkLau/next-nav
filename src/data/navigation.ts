// data/navigation.ts
export interface NavigationItem {
  id: string;
  name: string;
  url: string;
  imgUrl?: string;
  category: string;
  favorite?: boolean;
  description?: string;
}

export const navigationData: NavigationItem[] = [
  {
    name: 'GitHub',
    url: 'https://github.com',
    imgUrl: '/images/github.png',
    category: '常用网站',
    favorite: true,
    description: '全球最大的代码托管平台'
  },
  {
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    imgUrl: '/images/mdn.png',
    category: '常用网站',
    favorite: true,
    description: '权威的Web技术文档'
  },
  {
    name: '电鸭',
    url: 'https://eleduck.com',
    imgUrl: '/images/eleduck.png',
    category: '远程社区',
    description: '电鸭社区是具有8年历史的远程工作招聘社区，也是远程办公互联网工作者们的聚集地。在社区，我们进行有价值的话题讨论，也分享远程、外包、零活、兼职、驻场等非主流工作机会。「只工作，不上班」是我们倡导的工作态度。'
  },
].map((item, index) => ({...item, id: String(index + 1)}));