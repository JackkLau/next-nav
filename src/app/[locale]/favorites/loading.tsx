export default function FavoritesLoading() {
  return (
    <main className="mx-auto w-full max-w-[1680px] px-2 pb-6 pt-5" aria-busy="true" aria-label="Loading">
      <div className="mx-auto h-8 w-44 animate-pulse rounded-lg bg-slate-200" />
      <div className="mx-auto mt-3 h-4 w-72 max-w-full animate-pulse rounded bg-slate-200/80" />
      <div className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({length: 8}, (_, index) => (
          <div key={index} className="h-[74px] animate-pulse rounded-xl border border-slate-200 bg-white/80" />
        ))}
      </div>
    </main>
  );
}
