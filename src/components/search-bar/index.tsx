'use client'
import React, {useState} from 'react';
import {Input} from '@/components/ui/input';
import {searchTool, SearchTool} from '@/data/searchTool';

function Index() {
  const [engine, setEngine] = useState(searchTool[0].url)
  const [content, setContent] = useState('')
  const [toolId, setToolId] = useState('0')

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }
  function onSelectEngine(tool: SearchTool) {
    setEngine(tool.url)
    setToolId(tool.id)
  }

  function handleSearch() {
    console.log('engine :>>', engine);
    if (engine) {
      window.open(`${engine}${content}`)
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setContent(e.target.value)
  }
  return (
    <>
      <div className="relative w-1/2 flex justify-between">
        <Input onInput={handleInput} onKeyDown={handleKeyDown}  className="rounded-4xl px-4" type="search" placeholder="远程工作" />
        {/*<FontAwesomeIcon onClick={handleSearch} icon={faSearch} className="absolute top-2 right-1 text-gray-400 text-xl cursor-pointer" />*/}
      </div>
      <div className="mt-2">
        <ul className="flex justify-between items-center">
          {searchTool.map((tool) => (
            <li onClick={() => onSelectEngine(tool)} key={tool.id} className={`mr-2   ${toolId === tool.id ? 'px-2 py-1 bg-blue-500 text-white rounded-lg': 'text-gray-500'}`}>
              <a className={"cursor-pointer visited:bg-blue-500"}>
                {tool.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Index;