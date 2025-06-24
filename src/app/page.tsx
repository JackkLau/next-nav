'use client'
import {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSearch,} from '@fortawesome/free-solid-svg-icons';
import {navigation1, navigationData} from '@/data/navigation';
import {Input} from '@/components/ui/input';
import {searchTool} from '@/data/searchTool';
import NaviItem from '@/components/navi-item';


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
    <div className="flex min-h-screen">
      {/* 主内容区 */}
      <main className="flex-grow container px-4">
        {/* 搜索栏 */}
        <div className="mb-8 flex flex-col items-center">
          <div>
            <ul>
              <li>

              </li>
            </ul>
          </div>
          <div className="relative w-1/2 flex justify-between">
            <Input className="rounded-4xl px-4" type="search" placeholder="远程工作" />
            <FontAwesomeIcon icon={faSearch} className="absolute top-2 right-4 text-gray-400 text-xl cursor-pointer" />
          </div>
          <div className="mt-2">
            <ul className="flex justify-between items-center">
              {searchTool.map((tool, index) => (
                <li key={tool.id} className="mr-4 text-gray-500 cursor-pointer">
                  {tool.name}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 导航列表 */}
        <div className="w-full " >
          <NaviItem navItems={navigationData.filter(item => item.category === '常用网站')} title={'常用网站'}></NaviItem>
          <NaviItem navItems={navigationData.filter(item => item.category === '远程社区')} title={'远程社区'}></NaviItem>
        </div>
      </main>


    </div>
  );
}
