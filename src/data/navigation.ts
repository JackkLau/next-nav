// data/navigation.ts
export const CategoryType: {
  [key: string]: string
} = {
  common: '常用网站',
  community: '优质社区',
  tools: '实用工具',
  remote: '远程机会',
  personal: '个人网站',
  resources: '资源收藏',
  mirror: '镜像站',
  navigation: '导航发现',
  entertainment: '影视娱乐',
  game: '游戏',
}

// 分类映射表：中文名称 -> 英文标识符
export const CategoryMapping: {
  [key: string]: string
} = {
  '常用网站': 'common',
  '优质社区': 'community',
  '实用工具': 'tools',
  '远程机会': 'remote',
  '个人网站': 'personal',
  '资源收藏': 'resources',
  '镜像站': 'mirror',
  '导航发现': 'navigation',
  '影视娱乐': 'entertainment',
  '游戏': 'game',
}

// 英文标识符 -> 中文名称映射
export const CategoryNameMapping: {
  [key: string]: string
} = {
  'common': '常用网站',
  'community': '优质社区',
  'tools': '实用工具',
  'remote': '远程机会',
  'personal': '个人网站',
  'resources': '资源收藏',
  'mirror': '镜像站',
  'navigation': '导航发现',
  'entertainment': '影视娱乐',
  'game': '游戏',
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
    category: CategoryType.common,
    favorite: true,
    description: '全球最大的代码托管平台 GitHub is where people build software. More than 150 million people use GitHub to discover, fork, and contribute to over 420 million projects.',
    needVPN: true,
  },
  {
    name: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    imgUrl: '/nav/2.png',
    category: CategoryType.common,
    favorite: true,
    description: '权威的Web技术文档 The MDN Web Docs site provides information about Open Web technologies including HTML, CSS, and APIs for both Web sites and progressive web apps.'
  },
  {
    name: '电鸭',
    url: 'https://eleduck.com',
    imgUrl: '/nav/3.png',
    category: CategoryType.community,
    description: '电鸭社区是具有8年历史的远程工作招聘社区，也是远程办公互联网工作者们的聚集地。在社区，我们进行有价值的话题讨论，也分享远程、外包、零活、兼职、驻场等非主流工作机会。「只工作，不上班」是我们倡导的工作态度。'
  },
  {
    name: 'V2EX',
    url: 'https://www.v2ex.com/',
    imgUrl: '/nav/4.png',
    category: CategoryType.community,
    description: '创意工作者的社区。讨论编程、设计、硬件、游戏等令人激动的话题。',
    needVPN: true,
  },
  {
    name: 'linux.do',
    url: 'https://linux.do/',
    imgUrl: '/nav/5.png',
    category: CategoryType.community,
    description: 'LINUX DO - 新的理想型社区'
  },
  {
    name: '远程工作者',
    url: 'https://remote-info.cn/',
    category: CategoryType.remote,
    description: '分享支持在中国区域内远程办公的国内外工作机会，主要是面向 IT 行业，偶尔也包含少量其他行业的工作机会。所有工作机会均为人工收集自网络，是否靠谱请自行判断，如有投递意愿，请访问原文联系。'
  },
  {
    name: '小蜜蜂',
    url: 'https://www.xmf.com/',
    imgUrl: '/nav/7.png',
    category: CategoryType.remote,
    description: '小蜜蜂云工作，国内专业的远程办公的SAAS平台和招聘网站，帮助企业招聘世界各地的优秀远程工作的人才和网上兼职人才，为自由职业者提供远程工作机会。',
  },
  {
    name: 'AILogoEasy',
    url: 'https://www.ailogoeasy.com/',
    imgUrl: '/nav/8.png',
    category: CategoryType.tools,
    description: '使用AILogoEasy.com免费设计引人注目的标志和网站图标。我们用户友好的文字转标志和文字转网站图标工具提供多种文件格式的可调整设计。'
  },
  {
    name: '不上班研究所',
    url: 'https://www.toocool.cc/',
    imgUrl: '/nav/9.png',
    category: CategoryType.personal,
    description: '不上班研究所，专注于研究低成本互联网创业项目，靠谱的副业赚钱干货，自由职业者远程工作信息，互联网诈骗套路揭秘等。致力于帮助互联网小白通过互联网赚到第一块钱以及不被割韭菜。'
  },
  {
    name: '运维咖啡吧',
    url: 'https://blog.ops-coffee.cn/',
    imgUrl: '',
    category: CategoryType.personal,
    description: '运维咖啡吧 - 享受技术带来的乐趣，体验生活给予的感动'
  },
  {
    name: '天涯神贴',
    url: 'https://github.com/als3453/Collection_TianYa',
    imgUrl: '/nav/10.png',
    category: CategoryType.resources,
    description: '这是一个收集天涯帖子的repo,包括近期爆火的天涯神贴210，一些比较小众的帖子等等。',
    needVPN: true,
  },
  {
    name: 'github镜像站',
    url: 'https://kkgithub.com',
    imgUrl: '/nav/1.png',
    category: CategoryType.mirror,
    description: '全球最大的代码托管平台',
  },
  {
    name: '咖啡吧导航',
    url: 'https://nav.ops-coffee.cn/',
    imgUrl: '',
    category: CategoryType.navigation,
    description: '简洁好用的常用网站导航，免费实用的在线工具大全',
  },
  {
    name: '发现导航 - 精选实用导航网站',
    url: 'https://nav3.cn/#/',
    imgUrl: '/nav/11.svg',
    category: CategoryType.navigation,
    description: '发现导航是一个轻量级免费且强大的导航网站',
  },
  {
    name: 'PixiJS',
    url: 'https://pixijs.com/',
    imgUrl: '/nav/12.png',
    category: CategoryType.tools,
    description: 'PixiJS - The HTML5 Creation Engine. Create beautiful digital content with the fastest, most flexible 2D WebGL renderer.',
  },
  {
    name: '学吧导航',
    url: 'https://www.xue8nav.com/',
    imgUrl: '/nav/13.png',
    category: CategoryType.navigation,
    description: '学吧导航，超过四十万学习爱好者都在用的专业学习网址大全学霸导航，汇集了国内外优质的学习网站和平台。网站囊括了综合平台、外语学习、编程算法、电脑办公、百科知识、设计剪辑、音乐艺术、文史哲理、医学政经、演讲座谈、数理化生等10余项分类，收录了上百个个优质的国内外学习网站。无论你是在校学生，还是上班人群，亦或是单纯的学习爱好者，无需再苦恼于四处寻找学习网站。',
  },
  {
    name: 'google收录',
    url: 'https://search.google.com/search-console',
    imgUrl: '/nav/14.png',
    category: CategoryType.tools,
    description: 'Google Search Console 是一项由 Google 提供的免费服务，可帮助您监控和维护您的网站在 Google 搜索结果中的展示情况以及排查问题。',
    needVPN: true,
  },
  {
    name: 'google广告',
    url: 'https://www.google.com/adsense/',
    imgUrl: '/nav/14.png',
    category: CategoryType.tools,
    description: 'Google AdSense广告系统 With Google AdSense, you can earn money from your online content.',
    needVPN: true,
  },
  {
    name: 'google趋势',
    url: 'https://trends.google.com/home',
    imgUrl: '/nav/14.png',
    category: CategoryType.tools,
    description: 'Google Trends了解全球用户都在搜什么',
    needVPN: true,
  },
  {
    name: 'google分析',
    url: 'https://analytics.google.com/analytics/',
    imgUrl: '/nav/14.png',
    category: CategoryType.tools,
    description: 'Google Analytics流量统计分析系统',
    needVPN: true,
  },
  {
    name: 'AI工具集',
    url: 'https://ai-bot.cn/',
    imgUrl: '/nav/15.png',
    category: CategoryType.navigation,
    description: 'AI工具集官网收录了国内外数百个AI工具，该导航网站包括AI写作工具、AI图像生成和背景移除、AI视频制作、AI音频转录、AI辅助编程、AI音乐生成、AI绘画设计、AI对话聊天等AI工具集合大全，以及AI学习开发的常用网站、框架和模型，帮助你加入人工智能浪潮，自动化高效完成任务！',
  },
  {
    name: '绝对影视',
    url: 'https://www.jdys.art/',
    imgUrl: '/nav/16.png',
    category: CategoryType.entertainment,
    description: '每日提供最新鲜的电影，电视剧，动画更新，支持电脑和移动设备的超清画质在线观看影视剧体验；免费观看最新Netflix（奈飞），Hulu，HBO，Apple，Amazon，Disney(迪士尼)等流媒体平台独占影视内容，包含最新电影、美剧、英剧、韩剧、日剧、新番等各类高清影视内容。',
  },
  {
    name: '7点电影',
    url: 'https://www.7.movie/',
    imgUrl: '/nav/17.png',
    category: CategoryType.entertainment,
    description: '提供最新最快的视频分享数据',
  },
  {
    name: '奈飞工厂',
    url: 'https://www.netflixgc.com/',
    imgUrl: '/nav/18.png',
    category: CategoryType.entertainment,
    description: '一个致力于免费提供奈飞影剧动漫的流媒体播放平台',
  },
  {
    name: '橘子动漫',
    url: 'https://www.jzacg.com/',
    imgUrl: '/nav/19.png',
    category: CategoryType.entertainment,
    description: '橘子动漫拥有高清晰画质的在线动漫，最新电影，观看完全免费、高速播放、更新及时在线，我们致力为所有动漫迷们提供最好看的动漫',
  },
  {
    name: '搜片',
    url: 'https://soupian.pro/',
    imgUrl: '/nav/20.png',
    category: CategoryType.entertainment,
    description: '搜片.com 聚合全网影片，你想看的全都找得到！每天搜集最新电影、电视剧、在线观看网址、蓝光高清正版免费看！',
  },
  {
    name: '电影先生',
    url: 'https://dyxs39.com/',
    imgUrl: '/nav/21.png',
    category: CategoryType.entertainment,
    description: '电影先生聚合全网影片，你想看的全都有！电影先生每天搜集互联网最新电影和电视剧，为广大用户免费提供无广告在线观看电影和电视剧服务，及时收录最新、最热、最全的电影大片,高清正版免费看。',
  },
  {
    name: '88影视',
    url: 'https://www.88tvs.org/',
    imgUrl: '/nav/22.png',
    category: CategoryType.entertainment,
    description: '88影视网实时为大家提供2023最新最热门电影电视剧动漫综艺在线观看、超前点播、vip电影免费看，海量影视资源，尽享极致观影体验。',
  },
  {
    name: '麦田影院',
    url: 'https://www.mtyy1.com/',
    imgUrl: '/nav/23.png',
    category: CategoryType.entertainment,
    description: '麦田影院(www.mtyy.tv)海量高清电影免费在线观看,无广告无VIP,每天更新最新电影,最新电视剧,SVIP永久免费看!',
  },
  {
    name: '许搜',
    url: 'https://www.xusou.cn/',
    imgUrl: '/nav/24.png',
    category: CategoryType.entertainment,
    description: '支持百度网盘，夸克网盘，阿里云盘，UC网盘，迅雷云盘等搜索服务，是您工作、学习、娱乐的网盘搜索神器。',
  },
  {
    name: 'libvio影视',
    url: 'https://www.libvio.fun/',
    imgUrl: '/nav/25.png',
    category: CategoryType.entertainment,
    description: 'LIBVIO提供免费观看最新电影热播电视剧,综艺,动漫,高清无广告蓝光1080P画质在线播放,流畅秒播不卡顿!',
  },
  {
    name: 'libvio影视',
    url: 'https://lkvod.me/',
    imgUrl: '/nav/26.png',
    category: CategoryType.entertainment,
    description: '来看点播(lkvod.me)聚合最新电影、电视剧、综艺、动漫、在线观看网站平台。做到最新、最快、最全的电影电视剧在线播放平台网站!',
  },
  {
    name: '低端影视',
    url: 'https://ddys.pro/',
    imgUrl: '',
    category: CategoryType.entertainment,
    description: '来看点播(lkvod.me)聚合最新电影、电视剧、综艺、动漫、在线观看网站平台。做到最新、最快、最全的电影电视剧在线播放平台网站!',
  },
  {
    name: '火车头影视',
    url: 'https://www.tdgo.shop/',
    imgUrl: '/nav/27.png',
    category: CategoryType.entertainment,
    description: '火车太堵(tdgo.shop)是一个免费在线影院，为广大影迷提供提供无广告无弹窗无删减高最新热播高清电影、电视剧，热门韩剧，美剧在线观看下载，每天更新好看的电影电视剧，尽在火车太堵',
  },
  {
    name: '7080影视搜',
    url: 'https://7080.wang/',
    imgUrl: '/nav/28.png',
    category: CategoryType.entertainment,
    description: '火车太堵(tdgo.shop)是一个免费在线影院，为广大影迷提供提供无广告无弹窗无删减高最新热播高清电影、电视剧，热门韩剧，美剧在线观看下载，每天更新好看的电影电视剧，尽在火车太堵',
  },
  {
    name: 'HDMOLI影视',
    url: 'https://www.hdmoli.pro/',
    imgUrl: '/nav/29.png',
    category: CategoryType.entertainment,
    description: 'HDMOLI 提供免费、高品质、同时支持电脑和移动设备的影视剧在线观看网站',
  },
  {
    name: '嘀哩嘀哩',
    url: 'http://dilidili9.com/',
    imgUrl: '',
    category: CategoryType.entertainment,
    description: '嘀哩嘀哩,原dilidili.com和dilili.name在线',
  },
  {
    name: 'Age动漫',
    url: 'https://www.agedm.live/',
    imgUrl: '/nav/30.png',
    category: CategoryType.entertainment,
    description: 'Age动漫专业的在线动漫网站，动漫免费在线观看，高品质画质，实时更新，追番利器!',
  },
  {
    name: '樱花动漫',
    url: 'https://www.yinhuadm.vip/',
    imgUrl: '/nav/31.png',
    category: CategoryType.entertainment,
    description: '樱花动漫,动漫,樱花动漫app下载_拥有上万集高清晰画质的在线动漫，观看完全免费、无须注册、高速播放、更新及时的专业在线樱花动漫站，我们致力为所有动漫迷们提供最好看的动漫。',
  },
  {
    name: 'bing收录',
    url: 'https://www.bing.com/webmasters/home?siteUrl=https://www.loverezhao.top/',
    imgUrl: '/nav/32.png',
    category: CategoryType.tools,
    description: 'Bing Webmaster Tools - Bing Webmaster Tools',
  },
  {
    name: '爱站网',
    url: 'https://www.aizhan.com/',
    imgUrl: '/nav/34.png',
    category: CategoryType.tools,
    description: '爱站网站长工具提供网站收录查询和站长查询以及百度权重值查询等多个站长工具，免费查询各种工具，包括有关键词排名查询，百度收录查询等。',
  },
  {
    name: '完美网址',
    url: 'https://www.9eip.com/',
    imgUrl: '/nav/33.png',
    category: CategoryType.navigation,
    description: '完美导航（www.9eip.com） 给您最好的互联网搜索功能和网址收集体验，拥有超强的聚合搜索引擎，精选大量实用的网址，（生活、休闲、办公、影视、工具、资源网址）超贴心的服务，某个网址失效了？找不到？完美导航会第一时间给您找出相关并且发布在失效网址页内和回复您的反馈。',
  },
  {
    name: '站长导航',
    url: 'https://18dh.cn/',
    imgUrl: '/nav/35.png',
    category: CategoryType.navigation,
    description: '站长导航网(www.18dh.cn)是全网最大的技术导航网站,专业为用户提供网址导航服务,学习技术就上站长导航,数千个优质站点等你来查阅',
  },
  {
    name: '吾爱导航',
    url: 'https://www.gxfcseo.com/',
    imgUrl: '/nav/36.png',
    category: CategoryType.navigation,
    description: '吾爱导航专注于收录全网高品质的网址，为广大网民提供优质站点预览、共享优质网络资源，做一个有帮助的网址导航。',
  },
  {
    name: '利器',
    url: 'https://liqi.io/',
    imgUrl: '/nav/37.png',
    category: CategoryType.personal,
    description: '「工具是一个过程：用大小形状都合适的物体，以最有效的方式完成工作。」 利器采访优秀的创造者，邀请他们来分享工作时所使用的工具，以及使用工具的方',
  },
  {
    name: 'Next实践教程',
    url: 'https://doc.loverezhao.top/',
    imgUrl: '/nav/38.png',
    category: CategoryType.personal,
    description: 'JackLove的个人博客，记录学习过程中的各种知识',
  },
  {
    name: 'TJ个人博客',
    url: 'https://blog.loverezhao.top/',
    imgUrl: '/nav/39.png',
    category: CategoryType.personal,
    description: 'TJ的个人博客，记录学习过程中的各种知识',
  },
  {
    name: '美图宝库',
    url: 'https://www.meituhd.com/',
    imgUrl: '/nav/41.png',
    category: CategoryType.resources,
    description: '美图宝库网站，提供海量高清壁纸资源，动漫、游戏、美女、风景等壁纸类型应有尽有。轻松下载心仪壁纸，装点您的电脑。壁纸大全任你挑选，尽在美图宝库！',
  },
  {
    name: '聚煊自媒体 - 专业新媒体运营工具 、资源导航网站 - JUXUAN自媒体导航',
    url: 'https://juxuan.pro/',
    imgUrl: '/nav/40.png',
    category: CategoryType.navigation,
    description: 'JUXUAN.PRO 新媒体运营必备助手，开后台、搜素材和找工具、教程 都及其方便，并且收录了大量的实用网址和干货（包含：排版工具、无版权图库、社群运营、数据分析、创意素材、等..）',
  },
  {
    name: 'Favicons CDN',
    url: 'https://favicons.teamtailor-cdn.com/',
    imgUrl: '/nav/42.png', // 通过The Favicon Finder获取的图标链接
    category: CategoryType.tools,
    favorite: false,
    description: 'A service finding icons on web sites. 专注于提供网站favicon图标的CDN服务，方便开发者快速调用各类网站的图标资源',
    needVPN: false,
  },
  {
    name: 'Pintree',
    url: 'https://www.pintree.io/',
    imgUrl: '/nav/44.png', // 通过The Favicon Finder获取的图标链接
    category: CategoryType.tools,
    favorite: false,
    description: '一款专注于网页内容收藏与整理的工具，支持一键保存网页、图片等信息并进行分类管理',
    needVPN: false,
  },
  {
    name: '牛码工具',
    url: 'https://niumatool.com/',
    imgUrl: '/nav/43.png', // 通过The Favicon Finder获取的图标链接
    category: CategoryType.tools,
    favorite: false,
    description: '一款集成多种实用功能的在线工具平台，涵盖文本处理、格式转换、开发辅助等多种工具',
    needVPN: false,
  },
  {
    name: '嗨纪录片',
    url: 'https://www.haiw.com/',
    imgUrl: '/nav/45.png', // 使用指定工具获取的图标链接
    category: CategoryType.resources,
    favorite: false,
    description: '提供自媒体解说高清纪录片素材下载的网站，主要涵盖央视、NHK、BBC、探索频道等出品的历史人文、旅行地理、生活美食等多种类型纪录片，支持4K、2K、1080P等多种清晰度下载',
    needVPN: false,
  },
  {
    "name": "一为忆",
    "url": "https://www.iowen.cn/",
    "imgUrl": "/nav/46.png",
    "category": CategoryType.personal,
    "favorite": false,
    "description": "一为忆博客，涵盖建站技巧、WordPress主题与插件、黑科技工具、前端资源等内容。",
    "needVPN": false
  },
  {
    "name": "Tabler",
    "url": "https://tabler.io/",
    "imgUrl": "/nav/47.png",
    "category": CategoryType.resources,
    "favorite": false,
    "description": "Tabler 是一个基于 Bootstrap 5 的开源 Web 应用 UI 组件库，包含丰富的响应式组件、模板和图标，适用于现代网页和管理后台开发。",
    "needVPN": false
  },
  {
    "name": "虫部落",
    "url": "https://www.chongbuluo.com/",
    "imgUrl": "/nav/48.png",
    "category": CategoryType.community,
    "favorite": false,
    "description": "虫部落是一个纯粹的搜索知识、技术和经验分享平台，虫部落快搜、虫部落学术搜索等搜索聚合工具均为虫部落原创出品，搜索世界的乐趣，就在虫部落！",
    "needVPN": false
  },
  {
    "name": "抓鱼鸭",
    "url": "https://www.zhuayuya.com/",
    "imgUrl": "/nav/49.svg",
    "category": CategoryType.navigation,
    "favorite": false,
    "description": "【摸鱼中国】抓鱼鸭 - 不仅仅是起始页,它能帮你收藏网站,还能帮你找到好玩的网站,还有聚合搜索帮你快速找到自己想要的,还有弹幕功能,跟小伙伴一起分享点有趣的事",
    "needVPN": false
  },
  {
    "name": "52破解",
    "url": "https://www.52pojie.cn/",
    "imgUrl": "/nav/50.png",
    "category": CategoryType.community,
    "favorite": false,
    "description": "吾爱破解论坛深耕软件逆向工程与反病毒技术领域，汇聚众多技术爱好者的智慧与经验，共同探索与分享前沿安全技术和防护策略，构建业内最具影响力的技术交流平台。 ",
    "needVPN": false
  },
  {
    "name": "吾爱在线工具箱",
    "url": "https://www.5ii.com/",
    "imgUrl": "/nav/51.png",
    "category": CategoryType.tools,
    "favorite": false,
    "description": "吾爱在线工具箱是集合了大量优质在线工具的网站平台，涵盖了开发工具、网站查询工具、编程工具、办公/代码转换工具、加解密工具等上百种便捷的在线工具，功能完善，无需登录。",
    "needVPN": false
  },
  {
    "name": "AllCani",
    "url": "https://www.allcani.com/",
    "imgUrl": "/nav/52.png",
    "category": CategoryType.resources,
    "favorite": false,
    "description": "AllCani网站，韩语启蒙素材网站",
    "needVPN": false
  },
  {
    "name": "发卡网联盟",
    "url": "https://fkwlm.com/",
    "imgUrl": "/nav/53.png",
    "category": CategoryType.navigation,
    "favorite": false,
    "description": "发卡网联盟是一个汇集各种发卡网站的导航平台，主要提供瓶盖/烟盒发卡网等服务的聚合。",
    "needVPN": false
  },
  {
    "name": "一流导航",
    "url": "https://16map.com/",
    "imgUrl": "/nav/54.png",
    "category": CategoryType.navigation,
    "favorite": false,
    "description": "一流导航(16map.com)致力于打造国内最好的互联网上优质网站网址大全，收录了全网好用强大的网站网址和软件包括设计、开发、影视、人工智能、AI、运营、生活、休闲、办公、工具、资源等超全面的网址和职业技巧内容，让您的上网体验更便捷更放心，努力成为全民级人人都在用的网址导航。",
    "needVPN": false
  },
  {
    name: '花猫导航 - 万象信息·一网打尽',
    url: 'https://huamaodh.com/',
    imgUrl: "/nav/55.png",
    category: CategoryType.navigation,
    favorite: false,
    description: '花猫导航是一个集信息收集、内容挖掘与数据分析为一体的智能导航平台。我们整理和关联全网的站点、影视、文章、网盘、图片、视频、人物与公司等多维数据，构建清晰可视的信息网络，帮助用户高效发现价值内容。',
  },
  {
    name: '导航数据生成器',
    url: '/tools/nav-gen',
    imgUrl: '/favicon.png',
    category: CategoryType.common,
    description: '输入网址一键生成导航数据代码，便于维护 navigation.ts',
    favorite: false
  },
  {
    name: '办公人导航-实用的办公生活导航网站！',
    url: 'https://www.bgrdh.com/',
    imgUrl: 'https://icons.duckduckgo.com/ip3/www.bgrdh.com.ico',
    category: CategoryType.navigation,
    description: '办公人导航是一个实用的办公生活导航网站,致力于分享优质的网站网址及软件资源等内容,帮助大家节省时间,提高办公生活效率!',
  },
  {
    name: 'Poki (宝玩) - 免费在线小游戏 - 马上玩！',
    url: 'https://poki.com/',
    imgUrl: 'https://a.poki-cdn.com/icons/favicon-32x32.png',
    category: CategoryType.game,
    description: '与Poki (宝玩)一起探索免费在线游戏的世界！即刻玩耍，无需下载，享受与所有设备兼容的游戏。',
    
  },
  {
    name: 'Sweetygame.com',
    url: 'https://www.sweetygame.com/',
    imgUrl: 'https://www.sweetygame.com/favicon.ico',
    category: CategoryType.game,
    description: 'Sweetygame is a professional game studio that mainly produces cute, fashion, and celebrity dress up games. We have about 11 years experience in creating high quality dress up games. And made many popular ones.        Now sweetygame.com brings princess dress up series. You can play the most fashionable and beautiful princess games here. Every girl has a princess dream, and we make your dreams come true.Every girl can be a princess! :) We also accept dress up and make up game commissions. If you have a site, and you want some great games, please contact us for more information. Please check the Commission Infos for more.',
  },
  {
    name: '适合所有年龄的免费线上游戏 - 今天就来体验！ - Y8.com',
    url: 'https://zh.y8.com/',
    imgUrl: 'https://img.y8.com/mobile_launch_icons/y8-192.png',
    category: CategoryType.game,
    description: '探索最佳在线免费游戏 - 沉浸在充满乐趣和冒险的世界中。探索数千款精彩游戏，现在就开始吧！',
  },
  {
    name: '小霸王，其乐无穷 。红白机，FC在线游戏，街机游戏，街机在线，NES games，NES games online，Super Mario',
    url: 'https://www.yikm.net/',
    imgUrl: 'https://img.1990i.com/f.png',
    category: CategoryType.game,
    description: '魂斗罗，超级玛丽，热血足球，三国志，合金弹头，拳皇。这些小时候的回忆，黑白电视机前玩着小霸王游戏机的那种感觉令人怀念，希望大家可以找回童年的快乐',
  },
  {
    name: 'slowroads',
    url: 'https://slowroads.io/',
    imgUrl: 'https://slowroads.io/favicon.svg',
    category: CategoryType.game,
    description: 'Endless driving zen',
  },


].map((item, index) => ({...item, id: String(index + 1)}));
