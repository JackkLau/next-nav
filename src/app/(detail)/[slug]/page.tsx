import {navigationData} from '@/data/navigation';
import Image from 'next/image';
import Link from 'next/link';
import QrBox from '@/components/qr-box';


export function generateStaticParams() {
  return navigationData.map((post) => ({
    slug: post.id,
  }))
}


export default async function Home({
                                     params,
                                   }: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
})
{
  const { slug: menuId } = await params
  const navItem = navigationData.find((item) => item.id === menuId);
  return (
    <div className="flex justify-center min-h-full">
      <div className={'flex flex-col w-10/12'}>
        <div className={'flex items-center w-full  md:w-3/5 md:p-6 p-2 border my-4 rounded-sm bg-gray-100'}>
          <Image
            width={150}
            height={150}
            src={navItem?.imgUrl ? navItem.imgUrl : '/favicon.png'}
            alt={navItem?.name || 'favicon'}
            className={'w-[50] h-[50] md:w-auto md:h-12  md:mr-8 mr-2'}
          >
          </Image>

          <div className={'h-full max-w-1/3 truncate'}>
            <h2 className={'mb-2 text-2xl font-bold truncate'}>{navItem?.name}</h2>

            <div  className={'w-fit text-center px-2 py-1  text-sm text-white bg-blue-500 border rounded-md'}>
            {navItem?.category}
          </div>
          </div>
          <div className={'flex-1 flex items-center justify-end '}>
            <Link title={navItem?.url || '/'} href={'/' + navItem?.url || '/'} target={'_blank'}
                  className="text-center ml-4 text-white md:text-lg text-sm hover:bg-blue-500 bg-blue-300 rounded-md p-2">
              直接访问
            </Link>
            <div
              className="flex items-center justify-end ml-4 text-white md:text-lg text-sm hover:bg-blue-500 bg-blue-300 rounded-md p-2">
              <QrBox url={navItem?.url || '/'}/>
            </div>
          </div>
        </div>

        <p className={'min-h-1/4 w-full px-4 py-1 bg-gray-100 text-gray-800 border '}>
          {navItem?.description}
        </p>
      </div>
    </div>
  )
}