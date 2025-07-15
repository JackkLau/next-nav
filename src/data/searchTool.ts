export interface SearchTool {
  id: string;
  name: string;
  url: string;
}

export const SearchToolMapping = {
  '必应': 'bing',
  '谷歌': 'google',
  '百度': 'baidu',
  '搜狗': 'sogou',
  '有道': 'youdao',
  '360搜索': '360',
  '头条搜索': 'toutiao',
  '知乎搜索': 'zhihu',
  'DuckDuckGo': 'duckduckgo',
  'Yahoo': 'yahoo',
  'Yandex': 'yandex',
  'Naver': 'naver',
  'You.com': 'you_com',
  'Brave': 'brave'
}

export const searchTool: SearchTool[] = [
  {
    name: '必应',
    url: 'https://cn.bing.com/search?q='
  },
  {
    name: '谷歌',
    url: 'https://www.google.com/search?q='
  },
  {
    name: '百度',
    url: 'https://www.baidu.com/s?wd='
  },
  {
    name: '搜狗',
    url: 'https://www.sogou.com/web?query='
  },
  {
    name: '有道',
    url: 'https://youdao.com/result?word='
  },
  {
    name: '360搜索',
    url: 'https://www.so.com/s?q='
  },
  {
    name: '头条搜索',
    url: 'https://so.toutiao.com/search?keyword='
  },
  {
    name: '知乎搜索',
    url: 'https://www.zhihu.com/search?type=content&q='
  },
  {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q='
  },
  {
    name: 'Yahoo',
    url: 'https://search.yahoo.com/search?p='
  },
  {
    name: 'Yandex',
    url: 'https://yandex.com/search/?text='
  },
  {
    name: 'Naver',
    url: 'https://search.naver.com/search.naver?query='
  },
  {
    name: 'You.com',
    url: 'https://you.com/search?q='
  },
  {
    name: 'Brave',
    url: 'https://search.brave.com/search?q='
  }
].map((item, index) => ({...item, id: String(index)}))