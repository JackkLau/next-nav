// data/navigation.ts
export const CategoryType: {
  [key: string]: string
} = {
  a: '常用网站',
  b: '远程社区',
  c: '实用工具',
  d: '个人网站',
  e: '资源收藏',
  f: '镜像站',
  g: '导航发现',
}

export interface NavigationItem {
  id: string;
  name: string;
  url: string;
  imgUrl?: string;
  category: string;
  favorite?: boolean;
  description?: string;
  needVPN?: boolean;
}

export const navigationData: NavigationItem[] = [
  {
    name: 'GitHub',
    url: 'https://github.com',
    imgUrl: '/nav/1.png',
    category: CategoryType.a,
    favorite: true,
    description: '全球最大的代码托管平台',
    needVPN: true,
  },
  {
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    imgUrl: '/nav/2.png',
    category: CategoryType.a,
    favorite: true,
    description: '权威的Web技术文档'
  },
  {
    name: '电鸭',
    url: 'https://eleduck.com',
    imgUrl: '/nav/3.png',
    category: CategoryType.b,
    description: '电鸭社区是具有8年历史的远程工作招聘社区，也是远程办公互联网工作者们的聚集地。在社区，我们进行有价值的话题讨论，也分享远程、外包、零活、兼职、驻场等非主流工作机会。「只工作，不上班」是我们倡导的工作态度。'
  },
  {
    name: 'V2EX',
    url: 'https://www.v2ex.com/',
    imgUrl: '/nav/4.png',
    category: CategoryType.b,
    description: '创意工作者的社区。讨论编程、设计、硬件、游戏等令人激动的话题。',
    needVPN: true,
  },
  {
    name: 'linux.do',
    url: 'https://linux.do/',
    imgUrl: '/nav/5.png',
    category: CategoryType.b,
    description: 'LINUX DO - 新的理想型社区'
  },
  {
    name: '远程工作者',
    url: 'https://remote-info.cn/',
    category: CategoryType.b,
    description: '分享支持在中国区域内远程办公的国内外工作机会，主要是面向 IT 行业，偶尔也包含少量其他行业的工作机会。所有工作机会均为人工收集自网络，是否靠谱请自行判断，如有投递意愿，请访问原文联系。'
  },
  {
    name: '小蜜蜂',
    url: 'https://www.xmf.com/',
    imgUrl: '/nav/7.png',
    category: CategoryType.b,
    description: '小蜜蜂云工作，国内专业的远程办公的SAAS平台和招聘网站，帮助企业招聘世界各地的优秀远程工作的人才和网上兼职人才，为自由职业者提供远程工作机会。',
  },
  {
    name: 'AILogoEasy',
    url: 'https://www.ailogoeasy.com/',
    imgUrl: '/nav/8.png',
    category: CategoryType.c,
    description: '使用AILogoEasy.com免费设计引人注目的标志和网站图标。我们用户友好的文字转标志和文字转网站图标工具提供多种文件格式的可调整设计。'
  },
  {
    name: '不上班研究所',
    url: 'https://www.toocool.cc/',
    imgUrl: '/nav/9.png',
    category: CategoryType.d,
    description: '不上班研究所，专注于研究低成本互联网创业项目，靠谱的副业赚钱干货，自由职业者远程工作信息，互联网诈骗套路揭秘等。致力于帮助互联网小白通过互联网赚到第一块钱以及不被割韭菜。'
  },
  {
    name: '运维咖啡吧',
    url: 'https://blog.ops-coffee.cn/',
    imgUrl: '',
    category: CategoryType.d,
    description: '运维咖啡吧 - 享受技术带来的乐趣，体验生活给予的感动'
  },
  {
    name: '天涯神贴',
    url: 'https://github.com/als3453/Collection_TianYa',
    imgUrl: '/nav/10.png',
    category: CategoryType.e,
    description: '这是一个收集天涯帖子的repo,包括近期爆火的天涯神贴210，一些比较小众的帖子等等。',
    needVPN: true,
  },
  {
    name: 'github镜像站',
    url: 'https://kkgithub.com',
    imgUrl: '/nav/1.png',
    category: CategoryType.f,
    description: '全球最大的代码托管平台',
  },
  {
    name: '咖啡吧导航',
    url: 'https://nav.ops-coffee.cn/',
    imgUrl: '',
    category: CategoryType.g,
    description: '简洁好用的常用网站导航，免费实用的在线工具大全',
  },
  {
    name: '发现导航',
    url: 'https://nav3.cn/#/',
    imgUrl: '/nav/11.svg',
    category: CategoryType.g,
    description: '简洁好用的常用网站导航，免费实用的在线工具大全',
  },
  {
    name: 'PixiJS | The HTML5 Creation Engine | PixiJS',
    url: 'https://pixijs.com/',
    imgUrl: '/nav/12.png',
    category: CategoryType.c,
    description: 'PixiJS - The HTML5 Creation Engine. Create beautiful digital content with the fastest, most flexible 2D WebGL renderer.',
  },
  {
    name: '学吧导航',
    url: 'https://www.xue8nav.com/',
    imgUrl: '/nav/13.png',
    category: CategoryType.g,
    description: '学吧导航，超过四十万学习爱好者都在用的专业学习网址大全学霸导航，汇集了国内外优质的学习网站和平台。网站囊括了综合平台、外语学习、编程算法、电脑办公、百科知识、设计剪辑、音乐艺术、文史哲理、医学政经、演讲座谈、数理化生等10余项分类，收录了上百个个优质的国内外学习网站。无论你是在校学生，还是上班人群，亦或是单纯的学习爱好者，无需再苦恼于四处寻找学习网站。',
  },






].map((item, index) => ({...item, id: String(index + 1)}));
