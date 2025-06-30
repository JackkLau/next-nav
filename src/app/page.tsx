import {CategoryType, navigationData} from '@/data/navigation';
import NaviItem from '@/components/navi-item';
import SearchBar from '@/components/search-bar';
import {Suspense} from 'react';


function SearchParamsComponent() {
  return (
    <div className="flex min-h-screen  overflow-y-auto mt-2">
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
          <SearchBar></SearchBar>
        </div>

        {/* 导航列表 */}
        <div className="w-full" >
          {
            Object.keys(CategoryType).map((type) =>{
              return <NaviItem key={type} navItems={navigationData.filter(item => item.category === CategoryType[type])} title={CategoryType[type]}></NaviItem>
            })
          }
        </div>
      </main>


    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsComponent />
    </Suspense>
  );
}