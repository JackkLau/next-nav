export interface SearchTool {
  id: string;
  name: string;
  url: string;
}

export const SearchToolMapping = {
  'Google': 'google',
  'Bing': 'bing',
  'DuckDuckGo': 'duckduckgo',
  'Yahoo': 'yahoo',
  'Yandex': 'yandex',
  'Naver': 'naver',
  'You.com': 'you_com',
  'Brave': 'brave'
}

export const searchTool: SearchTool[] = [
  {
    name: 'Google',
    url: 'https://www.google.com/search?q='
  },
  {
    name: 'Bing',
    url: 'https://www.bing.com/search?q='
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
