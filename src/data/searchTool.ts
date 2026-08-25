export interface SearchTool {
  id: string;
  name: string;
  kind: 'site' | 'external';
  url?: string;
}

export const SearchToolMapping = {
  'This Site': 'this_site',
  'Google': 'google',
  'Bing': 'bing',
  'DuckDuckGo': 'duckduckgo',
  'Yahoo': 'yahoo',
  'Yandex': 'yandex',
  'Naver': 'naver',
  'You.com': 'you_com',
  'Brave': 'brave'
}

const searchToolDefinitions: Omit<SearchTool, 'id'>[] = [
  {
    name: 'This Site',
    kind: 'site'
  },
  {
    name: 'Google',
    kind: 'external',
    url: 'https://www.google.com/search?q='
  },
  {
    name: 'Bing',
    kind: 'external',
    url: 'https://www.bing.com/search?q='
  },
  {
    name: 'DuckDuckGo',
    kind: 'external',
    url: 'https://duckduckgo.com/?q='
  },
  {
    name: 'Yahoo',
    kind: 'external',
    url: 'https://search.yahoo.com/search?p='
  },
  {
    name: 'Yandex',
    kind: 'external',
    url: 'https://yandex.com/search/?text='
  },
  {
    name: 'Naver',
    kind: 'external',
    url: 'https://search.naver.com/search.naver?query='
  },
  {
    name: 'You.com',
    kind: 'external',
    url: 'https://you.com/search?q='
  },
  {
    name: 'Brave',
    kind: 'external',
    url: 'https://search.brave.com/search?q='
  }
]

export const searchTool: SearchTool[] = searchToolDefinitions.map(
  (item, index) => ({...item, id: String(index)}),
)
