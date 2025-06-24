export interface SearchTool {
  id: string;
  name: string;
  url: string;
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
    name:'有道',
    url: 'https://youdao.com/result?word='
  }
].map((item, index) => ({...item, id: String(index)}))