'use client';

import catalog from '@/lib/schemes/scheme_catalog.json' with { type: 'json' };
import details from '@/lib/schemes/scheme_details.json' with { type: 'json' };
import type { LanguageCode } from '@/lib/language/language';
import type { EligibilityStatus, RankedScheme, MatcherInput, ExtractedIntent } from '@/lib/schemes/matcher';
import { useState } from 'react';
import EligibilityVerificationInline from '@/components/schemes/EligibilityVerificationInline';

interface SchemeDetailProps {
  language: LanguageCode;
  location?: { state: string; district: string };
  match: RankedScheme;
  onBack: () => void;
  schemeId: string;
}

interface DetailRecord {
  id: string;
  name: string;
  officialUmangUrl: string | null;
  sourceStatus: string;
  sections: Record<string, string[]>;
}

interface CatalogRecord {
  id: string;
  application_route: string;
  temporal_note: string | null;
}

const detailById = new Map((details.schemes as unknown as DetailRecord[]).map((scheme) => [scheme.id, scheme]));
const catalogById = new Map((catalog.schemes as CatalogRecord[]).map((scheme) => [scheme.id, scheme]));

const COPY = {
  en: {
    back: 'Back to results', benefit: 'Benefits / support available', documents: 'Documents required',
    eligibility: 'Eligibility', eligibilityStatus: 'Current eligibility assessment', exclusions: 'Exclusions / blockers',
    howToApply: 'How to apply', importantNote: 'Important source / status note',
    missing: 'Not available in our current knowledge base.', officialLink: 'Open official source',
    officialSource: 'Official source / application link', route: 'Application route / intermediary', sourceLanguage: '',
    stillToCheck: 'What may still need to be checked', summary: 'What this scheme can help you with',
    why: 'Why this scheme was recommended',
  },
  or: {
    back: 'ଫଳାଫଳକୁ ଫେରନ୍ତୁ', benefit: 'ମିଳୁଥିବା ସୁବିଧା / ସହାୟତା', documents: 'ଆବଶ୍ୟକ ଦଲିଲ',
    eligibility: 'ଯୋଗ୍ୟତା', eligibilityStatus: 'ବର୍ତ୍ତମାନର ଯୋଗ୍ୟତା ଆକଳନ', exclusions: 'ବାଦ ପଡ଼ିବାର କାରଣ / ପ୍ରତିବନ୍ଧକ',
    howToApply: 'କିପରି ଆବେଦନ କରିବେ', importantNote: 'ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ସୂତ୍ର / ସ୍ଥିତି ସୂଚନା',
    missing: 'ଆମର ବର୍ତ୍ତମାନର ଜ୍ଞାନ ଭଣ୍ଡାରରେ ଏହି ସୂଚନା ଉପଲବ୍ଧ ନାହିଁ।', officialLink: 'ସରକାରୀ ସୂତ୍ର ଖୋଲନ୍ତୁ',
    officialSource: 'ସରକାରୀ ସୂତ୍ର / ଆବେଦନ ଲିଙ୍କ', route: 'ଆବେଦନ ମାର୍ଗ / ମଧ୍ୟସ୍ଥ ସଂସ୍ଥା',
    sourceLanguage: 'ସରକାରୀ ସୂଚନାର ଓଡ଼ିଆ ଅନୁବାଦ ଉପଲବ୍ଧ ନଥିବାରୁ ମୂଳ ଇଂରାଜୀ ତଥ୍ୟ ଦିଆଯାଇଛି।',
    stillToCheck: 'ଏବେ ଯାଞ୍ଚ କରିବାକୁ ବାକି', summary: 'ଏହି ଯୋଜନା କିପରି ସାହାଯ୍ୟ କରିପାରେ',
    why: 'ଏହି ଯୋଜନା କାହିଁକି ସୁପାରିଶ କରାଗଲା',
  },
} as const;

const ELIGIBILITY_COPY: Record<LanguageCode, Record<EligibilityStatus, string>> = {
  en: { ELIGIBLE: 'Eligible', POTENTIALLY_ELIGIBLE: 'Potentially eligible', UNKNOWN: 'Eligibility needs to be checked', EXCLUDED: 'Not eligible' },
  or: { ELIGIBLE: 'ଯୋଗ୍ୟ', POTENTIALLY_ELIGIBLE: 'ସମ୍୭ାବ୍ୟ ଭାବେ ଯୋଗ୍ୟ', UNKNOWN: 'ଯୋଗ୍ୟତା ଯାଞ୍ଚ ଆବଶ୍ୟକ', EXCLUDED: 'ଯୋଗ୍ୟ ନୁହେଁ' },
};

function sectionLines(record: DetailRecord | undefined, names: string[], limit: number): string[] {
  if (!record) return [];
  return names.flatMap((name) => record.sections[name] ?? [])
    .flatMap((value) => value.split(/\r?\n/)).map((value) => value.trim()).filter(Boolean).slice(0, limit);
}

function summaryText(record: DetailRecord | undefined): string | undefined {
  const source = sectionLines(record, ['Details'], 1)[0];
  if (!source) return undefined;
  const sentences = source.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((value) => value.trim()) ?? [source];
  return sentences.slice(0, 2).join(' ');
}

function humanize(value: string): string {
  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return <section className="rounded-2xl border border-[#d8e3ef] bg-white p-5 sm:p-6">
    <h2 className="text-lg font-bold text-[#18324e]">{title}</h2>
    <div className="mt-3 text-sm leading-6 text-[#405267]">{children}</div>
  </section>;
}

function SourceList({ empty, items }: { empty: string; items: string[] }) {
  if (items.length === 0) return <p className="text-[#667789]">{empty}</p>;
  return <ul className="space-y-2">{items.map((item, index) => <li className="flex gap-2" key={`${index}-${item}`}>
    <span aria-hidden="true" className="mt-[1px] font-bold text-[#28714a]">✓</span><span>{item}</span>
  </li>)}</ul>;
}

export default function SchemeDetail({ language, location, match, onBack, schemeId }: SchemeDetailProps) {
  const copy = COPY[language];
  const detail = detailById.get(schemeId);
  const catalogRecord = catalogById.get(schemeId);
  const benefits = sectionLines(detail, ['Benefits'], 6);
  const eligibility = sectionLines(detail, ['Eligibility'], 6);
  const exclusions = sectionLines(detail, ['Exclusion', 'Exclusions'], 4);
  const documents = sectionLines(detail, ['Documents Required'], 7);
  const application = sectionLines(detail, ['Application Process'], 7);
  const implementingAgency = sectionLines(detail, ['Implementing Agency'], 3);
  const sourceUnavailable = !detail || detail.sourceStatus === 'no_detail_text';
  const unresolved = match.unknownCriteria.length > 0 ? match.unknownCriteria : [
    language === 'or' ? 'ମ୍ୟାଚର ଅତିରିକ୍ତ ଅଜଣା ମାନଦଣ୍ଡ ଫେରାଇ ନାହିଁ।' : 'The matcher returned no additional unknown criteria.',
  ];

  return <main className="min-h-screen bg-[#f5f8fc] text-[#111]">
    <header className="border-b border-[#dce3eb] bg-white"><div className="mx-auto flex min-h-16 max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
      <span className="text-xl font-bold tracking-[0.08em] text-[#123f76]">UMANG</span>
      {location ? <span className="text-sm text-[#536579]">{location.district}, {location.state}</span> : null}
    </div></header>

    <div className="mx-auto w-full max-w-[1060px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
      <button className="text-sm font-semibold text-[#2458a6] hover:underline" onClick={onBack} type="button">← {copy.back}</button>
      <section className="mt-5 rounded-2xl border border-[#b9cee5] bg-white p-5 shadow-[0_8px_24px_rgba(26,77,132,0.08)] sm:p-7">
        <span className="inline-flex rounded-full bg-[#dcecff] px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] text-[#08478f]">{match.relevance} MATCH</span>
        <h1 className="mt-3 text-2xl font-bold leading-tight text-[#14283f] sm:text-3xl">{match.name}</h1>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.08em] text-[#617287]">{copy.summary}</p>
        <p className="mt-1.5 max-w-[780px] text-sm leading-6 text-[#405267]">{summaryText(detail) ?? copy.missing}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#e1e7ee] pt-4 text-sm">
          <span className="font-semibold text-[#243e59]">{copy.eligibilityStatus}:</span>
          <span className="rounded-full bg-[#edf1f5] px-3 py-1.5 font-semibold text-[#4a5968]">{ELIGIBILITY_COPY[language][match.eligibilityStatus]}</span>
        </div>
        {copy.sourceLanguage && !sourceUnavailable ? <p className="mt-3 text-xs leading-5 text-[#69798a]">{copy.sourceLanguage}</p> : null}
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Section title={copy.why}><SourceList empty={copy.missing} items={match.matchedCriteria} /></Section>
        <Section title={copy.stillToCheck}><SourceList empty={copy.missing} items={unresolved} /></Section>
        <Section title={copy.benefit}><SourceList empty={copy.missing} items={benefits} /></Section>
        <Section title={copy.eligibility}><SourceList empty={copy.missing} items={eligibility} />
          {exclusions.length > 0 ? <div className="mt-5 border-t border-[#e3e8ee] pt-4"><h3 className="font-bold text-[#8b3434]">{copy.exclusions}</h3><div className="mt-2"><SourceList empty={copy.missing} items={exclusions} /></div></div> : null}

          {/* Eligibility Verification Section */}
          <EligibilityVerificationInline
            schemeId={schemeId}
            language={language}
            location={location}
            matcherInput={{
              text: match.name,
              state: location?.state,
              district: location?.district
              // Note: Other fields like age, income, etc. would come from user's journey
              // For now, but we'll start with what we have and ask for missing info
            }}
          />
        </Section>
        <Section title={copy.documents}><SourceList empty={copy.missing} items={documents} /></Section>
        <Section title={copy.howToApply}><SourceList empty={copy.missing} items={application} /></Section>
        <Section title={copy.route}>
          {catalogRecord?.application_route && catalogRecord.application_route !== 'unknown' ? <p className="font-semibold text-[#263f5a]">{humanize(catalogRecord.application_route)}</p> : <p className="text-[#667789]">{copy.missing}</p>}
          {implementingAgency.length > 0 ? <div className="mt-3"><SourceList empty={copy.missing} items={implementingAgency} /></div> : null}
        </Section>
        <Section title={copy.officialSource}>{detail?.officialUmangUrl ? <a className="inline-flex rounded-lg bg-[#0b438f] px-4 py-2.5 font-semibold text-white hover:bg-[#073975]" href={detail.officialUmangUrl} rel="noreferrer" target="_blank">{copy.officialLink} ↗</a> : <p className="text-[#667789]">{copy.missing}</p>}</Section>
      </div>

      {catalogRecord?.temporal_note || sourceUnavailable ? <section className="mt-5 rounded-xl border border-[#e7cc91] bg-[#fff9e9] p-4 text-sm leading-6 text-[#674e18]">
        <h2 className="font-bold">{copy.importantNote}</h2><p className="mt-1">{catalogRecord?.temporal_note ?? copy.missing}</p>
      </section> : null}
    </div>
  </main>;
}