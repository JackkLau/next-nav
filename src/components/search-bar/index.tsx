'use client'
import React, {useState} from 'react';
import {Input} from '@/components/ui/input';
import {searchTool, SearchToolMapping} from '@/data/searchTool';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';

function Index() {
  const t = useTranslations();
  const [engine, setEngine] = useState(searchTool[0].url)
  const [toolId, setToolId] = useState('0')
  const [content, setContent] = useState('')

  function onSelectEngine(value: string) {
    const selected = searchTool.find(tool => tool.id === value)
    if (selected) {
      setEngine(selected.url)
      setToolId(selected.id)
    }
  }

  function handleSearch() {
    const query = content.trim();
    if (engine && query) {
      window.open(`${engine}${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer')
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setContent(e.target.value)
  }
  return (
    <form
      className="w-full"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        handleSearch();
      }}
    >
      <div className="flex w-full items-center overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-1 shadow-sm shadow-slate-950/5 transition-[background-color,border-color,box-shadow] focus-within:border-blue-300 focus-within:bg-white focus-within:shadow-md focus-within:shadow-slate-950/[0.04] focus-within:ring-2 focus-within:ring-blue-100/70">
        {/* shadcn Select 组件 */}
        <Select value={toolId} onValueChange={onSelectEngine}>
          <SelectTrigger className="h-10 max-w-[42%] rounded-xl border-none bg-slate-100 px-2.5 text-xs font-medium text-slate-700 shadow-none focus:outline-none focus:ring-0 sm:max-w-none sm:px-3 sm:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="bottom" className="rounded-xl border-slate-200 shadow-xl shadow-slate-950/10">
            {searchTool.map(tool => (
              <SelectItem key={tool.id} value={tool.id}>{t(`search_tool.${SearchToolMapping[tool.name as keyof typeof SearchToolMapping]}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* 搜索输入框 */}
        <Input
          onChange={handleInput}
          className="h-10 min-w-0 flex-1 rounded-none border-none bg-transparent px-3 text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus:outline-none focus:ring-0 focus-visible:border-transparent focus-visible:ring-0"
          type="search"
          aria-label={t('search_placeholder')}
          placeholder={t('search_placeholder')}
          style={{ boxSizing: 'border-box' }}
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          aria-label={t('search_placeholder')}
        >
          <Search className="size-[18px]" strokeWidth={2.2} />
        </button>
      </div>
    </form>
  );
}

export default Index;
