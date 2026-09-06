'use client'
import React, {useEffect, useRef, useState, useTransition} from 'react';
import {Input} from '@/components/ui/input';
import {searchTool, SearchToolMapping} from '@/data/searchTool';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import { MAX_SITE_SEARCH_QUERY_LENGTH } from '@/lib/site-search';

function Index({initialQuery = ''}: {initialQuery?: string}) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [toolId, setToolId] = useState('0')
  const [content, setContent] = useState(initialQuery)
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditing = target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT';

      if (event.key === '/' && !isEditing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', focusSearch);
    return () => document.removeEventListener('keydown', focusSearch);
  }, []);

  function onSelectEngine(value: string) {
    const selected = searchTool.find(tool => tool.id === value)
    if (selected) {
      setToolId(selected.id)
    }
  }

  function handleSearch() {
    const query = content.trim();
    const selected = searchTool.find(tool => tool.id === toolId) || searchTool[0];
    if (!query) return;

    if (selected.kind === 'site') {
      startTransition(() => {
        router.push(`/${locale}/search?q=${encodeURIComponent(query)}`);
      });
      return;
    }

    if (selected.url) {
      window.open(`${selected.url}${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer')
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    setContent(e.target.value)
  }

  function clearSearch() {
    setContent('');
    inputRef.current?.focus();

    if (pathname === `/${locale}/search` && initialQuery) {
      startTransition(() => {
        router.replace(`/${locale}/search`);
      });
    }
  }

  return (
    <form
      className="w-full"
      role="search"
      action={`/${locale}/search`}
      method="get"
      aria-busy={isPending}
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
          ref={inputRef}
          name="q"
          value={content}
          onChange={handleInput}
          className="h-10 min-w-0 flex-1 rounded-none border-none bg-transparent px-3 text-sm text-slate-900 shadow-none placeholder:text-slate-400 focus:outline-none focus:ring-0 focus-visible:border-transparent focus-visible:ring-0"
          type="search"
          maxLength={MAX_SITE_SEARCH_QUERY_LENGTH}
          aria-keyshortcuts="/"
          aria-label={t('search_placeholder')}
          placeholder={t('search_placeholder')}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && content) {
              event.preventDefault();
              clearSearch();
            }
          }}
          style={{ boxSizing: 'border-box' }}
        />
        {content && (
          <button
            type="button"
            onClick={clearSearch}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label={t('clear_search')}
          >
            <X className="size-4" />
          </button>
        )}
        <button
          type="submit"
          disabled={!content.trim() || isPending}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          aria-label={t('search_placeholder')}
        >
          {isPending ? (
            <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />
          ) : (
            <Search className="size-[18px]" strokeWidth={2.2} aria-hidden="true" />
          )}
          <span className="sr-only">{isPending ? t('searching') : t('search_placeholder')}</span>
        </button>
      </div>
    </form>
  );
}

export default Index;
