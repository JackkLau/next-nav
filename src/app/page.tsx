'use client'
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCompass,
  faSearch,
  faStar,
  faExternalLink,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'; // 空心星
import { navigationData, NavigationItem } from '@/data/navigation';


export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);

  // 过滤导航数据
  const filteredItems = navigationData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const isFavorite = showFavorites ? item.favorite : true;
    return matchesSearch && isFavorite;
  });

  return (
    <div className="grid grid-rows-[20px_0.5fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-dark flex items-center">
            <FontAwesomeIcon icon={faCompass} className="mr-2 text-primary" />
            流苏导航
          </h1>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="flex-grow container mx-auto px-4 py-2">
        {/* 搜索栏 */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索导航名称或分类..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFavorites(false)}
              className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-300 ${
                !showFavorites ? 'bg-primary/10 border-primary text-primary' : ''
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setShowFavorites(true)}
              className={`px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-300 ${
                showFavorites ? 'bg-primary/10 border-primary text-primary' : ''
              }`}
            >
              <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
              收藏
            </button>
          </div>
        </div>

        {/* 导航列表 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.length === 0 ? (
            <div className="text-center text-gray-500 py-16 col-span-full">
              {showFavorites ? (
                <>
                  <FontAwesomeIcon icon={faStarRegular}  />
                  <p>暂无收藏的导航</p>
                </>
              ) : (
                <>
                  <p>没有找到匹配的导航项</p>
                </>
              )}
            </div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300 group"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-dark group-hover:text-primary transition-all duration-300">{item.name}</h3>
                    {item.favorite ? (
                      <span className="text-yellow-400"><FontAwesomeIcon icon={faStar} /></span>
                    ) : (
                      <span className="text-gray-300"><FontAwesomeIcon icon={faStarRegular} /></span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm truncate mb-4">{item.category}</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-primary/10 hover:bg-primary/20 text-primary text-center px-3 py-2 rounded-lg text-sm transition-all duration-300"
                  >
                    <FontAwesomeIcon icon={faExternalLink} className="mr-1" />
                    访问
                  </a>
                  {item.description && (
                    <p className="text-gray-600 text-sm mt-3 line-clamp-2">{item.description}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-dark text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© 2025 流苏导航 | 纯静态版本</p>
        </div>
      </footer>
    </div>
  );
}
