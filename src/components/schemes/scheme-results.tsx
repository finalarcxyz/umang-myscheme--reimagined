'use client';

import { useState } from 'react';
import Link from 'next/link';
import SchemeDetail from '@/components/schemes/scheme-detail';
import type { LanguageCode } from '@/lib/language/language';
import { catalog } from '@/lib/schemes/loader';
import type {
  EligibilityStatus,
  MatcherResult,
  RankedScheme,
  Relevance,
} from '@/lib/schemes/matcher';

interface SchemeResultsProps {
  goal: string;
  language: LanguageCode;
  location?: {
    state: string;
    district: string;
  };
  onEditGoal: () => void;
  result: MatcherResult;
}

interface CatalogScheme {
  id: string;
  need_types: string[];
}

const supportByScheme = new Map(
  (catalog.schemes as CatalogScheme[]).map((scheme) => [scheme.id, scheme.need_types])
);

const GOAL_LABELS: Record<string, string> = {
  start_new_activity: 'Start a new activity',
  grow_existing_activity: 'Grow an existing activity',
  protect_income: 'Protect your income',
  reduce_cost_or_improve_productivity: 'Reduce costs or improve productivity',
  improve_productivity: 'Improve productivity',
  access_credit: 'Get credit or financing',
  access_subsidy: 'Find subsidy support',
  sell_or_market: 'Sell or market your produce',
};

const ELIGIBILITY_LABELS: Record<EligibilityStatus, string> = {
  ELIGIBLE: 'Eligible',
  POTENTIALLY_ELIGIBLE: 'Potentially eligible',
  UNKNOWN: 'Eligibility needs to be checked',
  EXCLUDED: 'Not eligible',
};

function humanize(value: string): string {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function interpretedGoal(result: MatcherResult): string {
  const goal = result.intent.goal ? GOAL_LABELS[result.intent.goal] ?? humanize(result.intent.goal) : 'Explore support';
  const activity = result.intent.activity ? humanize(result.intent.activity).toLowerCase() : undefined;
  if (!activity) return goal;

  if (result.intent.goal === 'start_new_activity') return `Start a ${activity} activity`;
  if (result.intent.goal === 'grow_existing_activity') return `Grow your ${activity} activity`;
  if (result.intent.goal === 'access_credit') return `Get financing for ${activity}`;
  return `${goal} for ${activity}`;
}

function whyThisMatches(scheme: RankedScheme): string {
  const usefulReasons = scheme.reasons
    .filter((reason) => !/^Location scope/i.test(reason))
    .slice(0, 2)
    .map((reason) => reason.replaceAll('_', ' ').replace(/\.$/, '').toLowerCase());

  if (usefulReasons.length === 0) {
    return 'This scheme aligns with the goal and context you provided.';
  }
  return `${usefulReasons.join('. ')}.`;
}

function relevanceLabel(relevance: Relevance): string {
  return relevance === 'LOW' ? 'RELEVANT' : `${relevance} MATCH`;
}

function eligibilityClasses(status: EligibilityStatus): string {
  if (status === 'ELIGIBLE') return 'bg-[#e4f4e8] text-[#176533]';
  if (status === 'POTENTIALLY_ELIGIBLE') return 'bg-[#fff3d8] text-[#805500]';
  if (status === 'EXCLUDED') return 'bg-[#fde8e8] text-[#a12626]';
  return 'bg-[#edf1f5] text-[#4a5968]';
}

function SchemeCard({
  featured,
  onSelect,
  scheme,
  viewLabel,
}: {
  featured?: boolean;
  onSelect: (schemeId: string) => void;
  scheme: RankedScheme;
  viewLabel: string;
}) {
  const support = supportByScheme.get(scheme.id) ?? [];
  const badgeClasses =
    scheme.relevance === 'HIGH'
      ? 'bg-[#dcecff] text-[#08478f]'
      : scheme.relevance === 'MEDIUM'
        ? 'bg-[#eaf3ff] text-[#24558d]'
        : 'bg-[#f0f2f4] text-[#596572]';

  return (
    <article
      className={`rounded-2xl border bg-white ${
        featured
          ? 'border-[#4f83c2] p-5 shadow-[0_10px_28px_rgba(26,77,132,0.12)] sm:p-6'
          : 'border-[#d8e0e8] p-4 shadow-[0_4px_14px_rgba(33,55,78,0.06)] sm:p-5'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] ${badgeClasses}`}>
            {relevanceLabel(scheme.relevance)}
          </span>
          <h3 className={`mt-3 font-bold leading-tight text-[#14283f] ${featured ? 'text-xl sm:text-2xl' : 'text-lg'}`}>
            {scheme.name}
          </h3>
        </div>
        {featured ? (
          <div className="rounded-xl bg-[#f1f6fc] px-3 py-2 text-right">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#64778d]">Match score</span>
            <span className="text-lg font-bold text-[#174f8e]">{scheme.score}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.07em] text-[#617287]">Why this matches</p>
          <p className="mt-1.5 text-sm leading-6 text-[#34465a]">{whyThisMatches(scheme)}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.07em] text-[#617287]">Support</p>
          <p className="mt-1.5 text-sm leading-6 text-[#34465a]">
            {support.length > 0 ? support.slice(0, 3).map(humanize).join(' + ') : 'Support type is not specified in the catalog'}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-[#e3e8ee] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${eligibilityClasses(scheme.eligibilityStatus)}`}>
          {ELIGIBILITY_LABELS[scheme.eligibilityStatus]}
        </span>
        <button
          className={`min-h-10 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6] ${
            featured
              ? 'bg-[#0b438f] text-white hover:bg-[#073975]'
              : 'border border-[#7fa2ca] bg-white text-[#174f8e] hover:bg-[#f2f7fd]'
          }`}
          onClick={() => onSelect(scheme.id)}
          type="button"
        >
          {viewLabel} →
        </button>
      </div>
    </article>
  );
}

export default function SchemeResults({ goal, language, location, onEditGoal, result }: SchemeResultsProps) {
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);
  const visibleSchemes = result.rankedSchemes.slice(0, 3);
  const strongest = visibleSchemes[0];
  const otherSchemes = visibleSchemes.slice(1);
  const selectedScheme = result.rankedSchemes.find((scheme) => scheme.id === selectedSchemeId);

  if (selectedSchemeId && selectedScheme) {
    return (
      <SchemeDetail
        language={language}
        location={location}
        match={selectedScheme}
        onBack={() => setSelectedSchemeId(null)}
        onDashboard={onEditGoal}
        schemeId={selectedSchemeId}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-[#111]">
      <header className="border-b border-[#dce3eb] bg-white">
        <div className="mx-auto flex min-h-16 max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
          <button aria-label="Go to dashboard" className="text-xl font-bold tracking-[0.08em] text-[#123f76] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6]" onClick={onEditGoal} type="button">UMANG</button>
          <div className="flex items-center gap-4">
            <Link className="text-sm font-semibold text-[#2458a6] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6]" href="/schemes">
              Browse schemes
            </Link>
            {location ? (
              <span className="hidden text-sm text-[#536579] sm:inline">
                {location.district}, {location.state}
              </span>
            ) : null}
            <button
              className="text-sm font-semibold text-[#2458a6] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6]"
              onClick={onEditGoal}
              type="button"
            >
              Edit goal
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1060px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <section className="rounded-2xl border border-[#d8e3ef] bg-white px-5 py-5 sm:px-7">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#55718f]">Your goal</p>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-[#14283f] sm:text-3xl">
            {interpretedGoal(result)}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#5a6878]">“{goal}”</p>
        </section>

        {strongest ? (
          <>
            <section className="mt-7">
              <h2 className="text-xl font-bold text-[#14283f] sm:text-2xl">
                {result.matchTier === 'closest'
                  ? 'Closest available schemes'
                  : strongest.relevance === 'HIGH'
                  ? 'We found highly relevant support for you'
                  : 'We found relevant support for you'}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-[#5a6878]">
                {result.matchTier === 'closest' && result.rawActivityHint
                  ? `We do not have a scheme specifically for ${result.rawActivityHint} yet. These are the closest options based on your goal and context. This does not mean government support does not exist; this prototype catalogue is intentionally limited.`
                  : 'These schemes are ranked from the goal and context you provided.'}
              </p>
              <div className="mt-4">
                <SchemeCard featured onSelect={setSelectedSchemeId} scheme={strongest} viewLabel={language === 'or' ? 'ଯୋଜନା ଦେଖନ୍ତୁ' : 'View scheme'} />
              </div>
            </section>

            {otherSchemes.length > 0 ? (
              <section className="mt-8">
                <h2 className="text-lg font-bold text-[#263b52]">Other relevant schemes</h2>
                <div className="mt-3 grid gap-4 lg:grid-cols-2">
                  {otherSchemes.map((scheme) => (
                    <SchemeCard key={scheme.id} onSelect={setSelectedSchemeId} scheme={scheme} viewLabel={language === 'or' ? 'ଯୋଜନା ଦେଖନ୍ତୁ' : 'View scheme'} />
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <section className="mt-7 rounded-2xl border border-[#d8e0e8] bg-white px-6 py-10 text-center">
            <h2 className="text-xl font-bold text-[#263b52]">We couldn’t find a strong match yet.</h2>
            <p className="mx-auto mt-2 max-w-[580px] text-sm leading-6 text-[#5a6878]">
              There is no relevant match in our current catalogue. This does not mean government support does not exist; this prototype&apos;s catalogue is intentionally limited, and more schemes and use cases can be added over time.
            </p>
            <p className="mx-auto mt-3 max-w-[580px] text-sm leading-6 text-[#536579]">
              This V1 focuses on selected livestock, farming, crop-protection, farmer-support, and small-business needs.
            </p>
            <div className="mx-auto mt-5 max-w-[580px] rounded-xl border border-[#d8e3ef] bg-[#f8fbff] px-4 py-3 text-left">
              <p className="text-sm font-bold text-[#263b52]">Try a supported goal next</p>
              <ul className="mt-1.5 space-y-1 text-sm leading-6 text-[#536579]">
                <li>Try: “I want to start goat farming”</li>
                <li>Or: “I want to start duck farming”</li>
                <li>Or: “I want to improve my farming”</li>
              </ul>
            </div>
            <button className="mt-5 rounded-lg bg-[#0b438f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#073975]" onClick={onEditGoal} type="button">
              Edit your goal
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
