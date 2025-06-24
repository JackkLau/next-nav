import {CategoryType, navigationData} from '@/data/navigation';
import NaviItem from '@/components/navi-item';
import SearchBar from '@/components/search-bar';


export default function Home() {
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
