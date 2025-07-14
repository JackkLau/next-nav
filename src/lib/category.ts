export function getCategorySlug(categoryName: string): string {
  const categoryToSlug: { [key: string]: string } = {
    '常用网站': 'common',
    '优质社区': 'community',
    '实用工具': 'tools',
    '远程机会': 'remote',
    '个人网站': 'personal',
    '资源收藏': 'resources',
    '镜像站': 'mirror',
    '导航发现': 'navigation',
    '影视娱乐': 'entertainment',
  };
  return categoryToSlug[categoryName] || categoryName;
} 