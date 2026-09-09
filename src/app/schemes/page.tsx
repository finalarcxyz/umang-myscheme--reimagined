import Link from 'next/link';
import { catalog } from '@/lib/schemes/loader';
import details from '@/lib/schemes/scheme_details.json' with { type: 'json' };
import { summaryText, type SchemeDetailRecord } from '@/lib/schemes/details';

interface CatalogScheme {
  id: string;
  name: string;
}

const detailById = new Map(
  (details.schemes as unknown as SchemeDetailRecord[]).map((scheme) => [scheme.id, scheme])
);

export default function BrowseSchemesPage() {
  const schemes = catalog.schemes as CatalogScheme[];

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-[#111]">
      <header className="border-b border-[#dce3eb] bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <Link className="text-xl font-bold tracking-[0.08em] text-[#123f76] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6]" href="/">
            UMANG
          </Link>
          <div className="flex items-center gap-4">
            <span aria-current="page" className="text-sm font-semibold text-[#2458a6]">Browse schemes</span>
            <Link className="text-sm font-semibold text-[#2458a6] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6]" href="/">
              Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1180px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <h1 className="text-3xl font-bold tracking-[-0.025em] text-[#14283f] sm:text-4xl">Browse all schemes</h1>
        <p className="mt-2 max-w-[680px] text-sm leading-6 text-[#536579]">
          Explore the {schemes.length} schemes currently included in this prototype catalogue.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schemes.map((scheme) => {
            const summary = summaryText(detailById.get(scheme.id));

            return (
              <Link
                className="group rounded-2xl border border-[#d8e0e8] bg-white p-5 shadow-[0_4px_14px_rgba(33,55,78,0.06)] transition hover:border-[#7fa2ca] hover:shadow-[0_8px_20px_rgba(33,55,78,0.1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6]"
                href={`/schemes/${scheme.id}`}
                key={scheme.id}
                prefetch={false}
              >
                <h2 className="text-lg font-bold leading-6 text-[#14283f]">{scheme.name}</h2>
                {summary ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#536579]">{summary}</p> : null}
                <span className="mt-4 inline-flex text-sm font-semibold text-[#2458a6] group-hover:underline">View scheme →</span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
