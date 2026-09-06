export default function SearchLoading() {
  return (
    <main className="mx-auto w-full max-w-[1680px] px-2 pb-6 pt-5" aria-busy="true">
      <div className="mx-auto h-8 w-52 animate-pulse rounded-lg bg-slate-200" />
      <div className="mx-auto mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200/80" />
      <div className="mx-auto mt-5 h-12 w-full max-w-2xl animate-pulse rounded-2xl border border-slate-200 bg-white/80" />
      <div className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({length: 8}, (_, index) => (
          <div key={index} className="h-[74px] animate-pulse rounded-xl border border-slate-200 bg-white/80" />
        ))}
      </div>
    </main>
  );
}
