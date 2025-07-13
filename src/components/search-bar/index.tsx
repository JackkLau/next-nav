'use client'
import React, {useState} from 'react';
import {Input} from '@/components/ui/input';
import {searchTool, SearchTool} from '@/data/searchTool';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';

function Index() {
  const [engine, setEngine] = useState(searchTool[0].url)
  const [toolId, setToolId] = useState('0')
  const [content, setContent] = useState('')

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }
  function onSelectEngine(value: string) {
    const selected = searchTool.find(tool => tool.id === value)
    if (selected) {
      setEngine(selected.url)
      setToolId(selected.id)
    }
  }

  function handleSearch() {
    if (engine) {
      window.open(`${engine}${content}`)
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setContent(e.target.value)
  }
  return (
    <div className="w-full flex items-center">
      <div className="flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden w-full">
        {/* shadcn Select 组件 */}
        <Select value={toolId} onValueChange={onSelectEngine}>
          <SelectTrigger className="h-12 px-3 text-base border-none rounded-l-xl rounded-r-none bg-transparent focus:ring-0 focus:outline-none shadow-none">
            <SelectValue placeholder="选择引擎" />
          </SelectTrigger>
          <SelectContent side="bottom">
            {searchTool.map(tool => (
              <SelectItem key={tool.id} value={tool.id}>{tool.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* 搜索输入框 */}
        <Input
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="h-12 px-4 text-base border-none rounded-r-xl rounded-l-none bg-transparent focus:ring-0 focus:outline-none flex-1 shadow-none"
          type="search"
          placeholder="远程工作"
          style={{ boxSizing: 'border-box' }}
        />
      </div>
    </div>
  );
}

export default Index;