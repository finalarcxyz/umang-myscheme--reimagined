'use client';

import { useEffect, useState, type ComponentType } from 'react';
import Link from 'next/link';
import {
  goalInputTranslations,
  LANGUAGE_LABELS,
  type LanguageCode,
} from '@/lib/language/language';
import {
  matchSchemes,
  type MatcherInput,
  type MatcherResult,
} from '@/lib/schemes/matcher';
import {
  selectNextQuestion,
  type QuestionSelection,
  type QuestionSelectorContext,
} from '@/lib/schemes/question-selector';
import SchemeResults from '@/components/schemes/scheme-results';
import type { IntentResolution } from '@/lib/intent/schema';

interface IconProps {
  className?: string;
}

interface GoalOption {
  id: string;
  translationKey: 'startBusiness' | 'farming' | 'goat' | 'duck' | 'pension' | 'insurance';
  icon: ComponentType<IconProps>;
}

function MenuIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function GlobeIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.7 12h16.6M12 3.5c2.1 2.3 3.2 5.1 3.2 8.5S14.1 18.2 12 20.5C9.9 18.2 8.8 15.4 8.8 12S9.9 5.8 12 3.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

function ChevronIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="m9 5 7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function DownIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 16 16">
      <path d="m4 6 4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
    </svg>
  );
}

function BusinessIcon({ className = 'h-10 w-10' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 48 48">
      <path d="M8 19h32l-3.5-9h-25L8 19Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M10 19v19h28V19M7 38h34M18 38V27h12v11" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M8 19c0 4 6 5 8 1 2 4 7 4 9 0 2 4 7 4 9 0 2 4 6 3 6-1" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function FarmingIcon({ className = 'h-10 w-10' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 48 48">
      <path d="M24 37V19M24 25c-7 0-12-4-12-11 7 0 12 4 12 11ZM24 20c7 0 12-4 12-11-7 0-12 4-12 11Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M9 38c4-5 9-6 15-2 6-4 11-3 15 2-9 3-21 3-30 0Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function LivestockIcon({ className = 'h-10 w-10' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 48 48">
      <path d="M11 22c5-6 15-7 22-2l4-4 4 3-2 6c1 3 0 6-3 8l-3-4v10M13 28v11M13 34h18M9 24v12M17 39v-5M31 39v-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="m34 17-2-5 4 2 2-4 1 6M37 23h.01" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  );
}

function FinancialIcon({ className = 'h-10 w-10' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 48 48">
      <path d="M8 29h6v11H8zM14 31l7-5h9c3 0 4 4 1 5h-6M14 39h17l10-7c2-2 0-5-3-3l-7 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <circle cx="26" cy="15" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M22 11h8M22 14h8M24 11c5 0 5 6 0 6l6 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function BulbIcon({ className = 'h-9 w-9' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 40 40">
      <path d="M14 24c-3-2-5-5-5-9a11 11 0 0 1 22 0c0 4-2 7-5 9l-1 5H15l-1-5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <path d="M16 33h8M20 10v8M17 15h6M20 2v3M5 15H2M38 15h-3M8 5l2 2M32 5l-2 2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

const goalOptions: GoalOption[] = [
  { id: 'goat', translationKey: 'goat', icon: LivestockIcon },
  { id: 'duck', translationKey: 'duck', icon: LivestockIcon },
  { id: 'business', translationKey: 'startBusiness', icon: BusinessIcon },
  { id: 'pension', translationKey: 'pension', icon: FinancialIcon },
  { id: 'farming', translationKey: 'farming', icon: FarmingIcon },
  { id: 'insurance', translationKey: 'insurance', icon: FinancialIcon },
];

const rotatingGoalPlaceholders = [
  'e.g. "I want to protect my crop from bad weather"',
  'e.g. "I need a tractor for my field"',
  'e.g. "I want to sell my vegetables at a better price"',
  'e.g. "I am a woman and want to start a small dairy"',
  'e.g. "I want to start fish farming in a pond"',
];


interface GoalInputScreenProps {
  language: LanguageCode;
  onLanguageChange: (language: LanguageCode) => void;
  location?: {
    state: string;
    district: string;
  };
}

type AskedQuestion = Extract<QuestionSelection, { shouldAsk: true }>;

function toMatcherInput(text: string, context: QuestionSelectorContext): MatcherInput {
  return {
    text,
    state: context.state,
    district: context.district,
    age: context.age,
    gender: context.gender,
    income: context.income,
    landArea: context.landArea,
    landStatus: context.landStatus,
    shgMember: context.shgMember,
    caste: context.caste,
    minorityStatus: context.minorityStatus,
    existingActivity: context.existingActivity,
  };
}

function contextWithAnswer(
  context: QuestionSelectorContext,
  field: string,
  answer: string
): QuestionSelectorContext {
  const normalized = answer.trim().toLowerCase();
  const number = Number(answer.replace(/[^\d.]/g, ''));
  const parsedNumber = Number.isFinite(number) && number > 0 ? number : undefined;

  if (field === 'age') return { ...context, age: parsedNumber };
  if (field === 'income') return { ...context, income: parsedNumber };
  if (field === 'landArea') return { ...context, landArea: parsedNumber };
  if (field === 'projectSize') return { ...context, projectSize: parsedNumber ?? 1 };
  if (field === 'pondStatus') {
    const pondStatus = /already|existing|have|achhi/.test(normalized)
      ? 'existing'
      : /new|create|dig|khola|none|no pond/.test(normalized)
        ? 'new'
        : 'none';
    return { ...context, pondStatus };
  }
  if (field === 'business/activity' || field === 'activity') {
    return { ...context, existingActivity: answer.trim() };
  }
  if (field === 'priorSubsidy') return { ...context, priorSubsidy: /yes|haan|ha/.test(normalized) };
  if (field === 'priorLoan') return { ...context, priorLoan: /yes|haan|ha/.test(normalized) };
  if (field === 'state') return { ...context, state: answer.trim() };
  if (field === 'district') return { ...context, district: answer.trim() };
  return context;
}

export default function GoalInputScreen({
  language,
  onLanguageChange,
  location,
}: GoalInputScreenProps) {
  const [goalText, setGoalText] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);
  const [isPlaceholderRotationStopped, setIsPlaceholderRotationStopped] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState('');
  const [conversationText, setConversationText] = useState('');
  const [questionContext, setQuestionContext] = useState<QuestionSelectorContext>({});
  const [activeQuestion, setActiveQuestion] = useState<AskedQuestion | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [showOtherAnswer, setShowOtherAnswer] = useState(false);
  const [finalResult, setFinalResult] = useState<MatcherResult | null>(null);
  const [resolvedIntent, setResolvedIntent] = useState<IntentResolution | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const copy = goalInputTranslations[language];

  useEffect(() => {
    const text = goalText.trim();
    if (!text) {
      setResolvedIntent(null);
      return;
    }

    // Optimistically clear previous intent when text changes significantly
    setResolvedIntent(null);

    const abortController = new AbortController();

    const timer = window.setTimeout(async () => {
      setIsResolving(true);
      try {
        const res = await fetch('/api/resolve-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, locale: language }),
          signal: abortController.signal,
        });
        if (res.ok) {
          const data = await res.json();
          if (!abortController.signal.aborted) {
            setResolvedIntent(data);
          }
        } else {
          if (!abortController.signal.aborted) setResolvedIntent(null);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error resolving intent:', error);
          if (!abortController.signal.aborted) setResolvedIntent(null);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsResolving(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      abortController.abort();
    };
  }, [goalText, language]);

  useEffect(() => {
    if (language !== 'en' || isPlaceholderRotationStopped) return;

    let fadeTimeout: number | undefined;
    const interval = window.setInterval(() => {
      setIsPlaceholderVisible(false);
      fadeTimeout = window.setTimeout(() => {
        setPlaceholderIndex((currentIndex) => (currentIndex + 1) % rotatingGoalPlaceholders.length);
        setIsPlaceholderVisible(true);
      }, 200);
    }, 3000);

    return () => {
      window.clearInterval(interval);
      if (fadeTimeout) window.clearTimeout(fadeTimeout);
    };
  }, [isPlaceholderRotationStopped, language]);

  function runIntelligence(text: string, context: QuestionSelectorContext) {
    const nextContext: QuestionSelectorContext = {
      ...context,
      text,
      state: context.state ?? location?.state,
      district: context.district ?? location?.district,
      language: language === 'or' ? 'od' : 'en',
    };
    const matcherInput = toMatcherInput(text, nextContext);
    if (resolvedIntent) {
      matcherInput.serverIntent = resolvedIntent;
    }
    const result = matchSchemes(matcherInput);
    const selection = selectNextQuestion(result, nextContext);

    setQuestionContext(nextContext);
    if (selection.shouldAsk) {
      setActiveQuestion(selection);
      setShowOtherAnswer(false);
      setFinalResult(null);
    } else {
      setActiveQuestion(null);
      setFinalResult(result);
    }
  }

  function submitGoal() {
    const text = goalText.trim();
    if (!text) {
      setActionNotice('Enter a goal before continuing.');
      return;
    }

    setActionNotice('');
    setConversationText(text);
    setFollowUpAnswer('');
    runIntelligence(text, {
      text,
      state: location?.state,
      district: location?.district,
      language: language === 'or' ? 'od' : 'en',
    });
  }

  function submitFollowUp(selectedAnswer?: string) {
    const answer = (selectedAnswer ?? followUpAnswer).trim();
    if (!activeQuestion || !answer) {
      setActionNotice('Answer the follow-up question before continuing.');
      return;
    }

    const combinedText = `${conversationText} ${answer}`.trim();
    const nextContext = contextWithAnswer(questionContext, activeQuestion.field, answer);
    setActionNotice('');
    setConversationText(combinedText);
    setFollowUpAnswer('');
    runIntelligence(combinedText, nextContext);
  }

  if (finalResult) {
    return (
      <SchemeResults
        goal={goalText.trim() || conversationText}
        language={language}
        location={location}
        onEditGoal={() => {
          setFinalResult(null);
          setActiveQuestion(null);
        }}
        result={finalResult}
      />
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#111111] sm:px-5 sm:py-6 lg:px-10 lg:py-8">
      <section className="mx-auto min-h-0 w-full max-w-[430px] overflow-hidden bg-white lg:max-w-[1180px]">
        <header className="grid h-14 grid-cols-[1fr_auto_1fr] items-center border-b border-[#d4d4d4] px-5 lg:h-[60px] lg:px-10">
          <button
            aria-label="Open menu"
            className="justify-self-start rounded-md p-1 text-[#222] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6]"
            onClick={() => setActionNotice('Menu options are not available yet.')}
            type="button"
          >
            <MenuIcon />
          </button>
          <span className="text-[20px] font-bold tracking-[0.06em] lg:text-[22px]">UMANG</span>
          <div className="flex items-center justify-self-end gap-2 text-[#222]">
            <Link className="text-xs font-semibold text-[#2458a6] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6]" href="/schemes">
              Browse schemes
            </Link>
            <div className="flex items-center">
              <GlobeIcon />
              <select
                aria-label="Language"
                className="h-9 appearance-none bg-white pl-1.5 pr-4 text-xs font-medium text-[#222] outline-none"
                onChange={(event) => onLanguageChange(event.target.value as LanguageCode)}
                value={language}
              >
                <option value="en">{LANGUAGE_LABELS.en}</option>
                <option value="or">{LANGUAGE_LABELS.or}</option>
              </select>
              <DownIcon className="-ml-3 h-3.5 w-3.5 pointer-events-none" />
            </div>
          </div>
        </header>

        <div className="px-5 pb-5 pt-5 sm:px-6 lg:px-16 lg:pb-7 lg:pt-7">
          <div className="text-center">
            <h1 className="mx-auto max-w-[330px] text-[27px] font-bold leading-[1.18] tracking-[-0.025em] lg:max-w-none lg:text-[32px]">
              {copy.question}
            </h1>
            <p className="mx-auto mt-3 max-w-[350px] text-[15px] leading-6 text-[#303030] lg:mt-2 lg:max-w-[580px] lg:text-[15px]">
              {copy.supporting}
            </p>
          </div>

          <div className="relative mx-auto mt-4 max-w-[900px] lg:mt-4">
            <textarea
              aria-label="Describe what you are trying to achieve"
              className={`h-[86px] w-full resize-none rounded-[14px] border border-[#333] bg-white px-4 py-3 text-[15px] leading-6 text-[#161616] outline-none transition placeholder:text-[#666] placeholder:transition-opacity placeholder:duration-200 focus:border-[#205aa5] focus:ring-2 focus:ring-[#dce9f8] lg:h-[94px] lg:px-5 lg:py-3 lg:text-base ${
                isPlaceholderVisible ? 'placeholder:opacity-100' : 'placeholder:opacity-0'
              }`}
              onChange={(event) => {
                if (event.target.value && !isPlaceholderRotationStopped) {
                  setIsPlaceholderRotationStopped(true);
                }
                setGoalText(event.target.value);
              }}
              placeholder={language === 'en' ? rotatingGoalPlaceholders[placeholderIndex] : copy.placeholder}
              value={goalText}
            />
          </div>

          <div className="mx-auto mt-3 flex max-w-[900px] items-center justify-end gap-3">
            {isResolving && (
              <span className="text-sm text-[#536579] animate-pulse">Resolving...</span>
            )}
            <button
              className="min-h-10 rounded-lg bg-[#0b438f] px-5 text-sm font-semibold text-white transition hover:bg-[#073975] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!goalText.trim() || isResolving}
              onClick={submitGoal}
              type="button"
            >
              Continue
            </button>
          </div>

          {activeQuestion ? (
            <div className="mx-auto mt-4 max-w-[900px] rounded-[13px] border border-[#8db4e8] bg-[#f5f9ff] p-4">
              <p className="text-sm font-semibold leading-5 text-[#173b68]">
                {activeQuestion.questions[language === 'or' ? 'od' : 'en']}
              </p>
              {activeQuestion.options?.length ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {activeQuestion.options.map((option) => (
                    <button
                      className="min-h-11 rounded-lg border border-[#7198c8] bg-white px-3 py-2 text-left text-sm font-medium text-[#173b68] transition hover:bg-[#eaf3ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6]"
                      key={option.id}
                      onClick={() => {
                        if (option.isOther) {
                          setShowOtherAnswer(true);
                          setFollowUpAnswer('');
                        } else {
                          submitFollowUp(option.value);
                        }
                      }}
                      type="button"
                    >
                      {option.labels[language === 'or' ? 'od' : 'en']}
                    </button>
                  ))}
                </div>
              ) : null}
              {!activeQuestion.options?.length || showOtherAnswer ? (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    aria-label="Answer follow-up question"
                    className="min-h-11 flex-1 rounded-lg border border-[#7198c8] bg-white px-3 text-sm text-[#161616] outline-none focus:border-[#205aa5] focus:ring-2 focus:ring-[#dce9f8]"
                    onChange={(event) => setFollowUpAnswer(event.target.value)}
                    value={followUpAnswer}
                  />
                  <button
                    className="min-h-11 rounded-lg bg-[#0b438f] px-4 text-sm font-semibold text-white transition hover:bg-[#073975] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!followUpAnswer.trim()}
                    onClick={() => submitFollowUp()}
                    type="button"
                  >
                    Submit answer
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mx-auto my-5 flex max-w-[900px] items-center gap-3 text-center text-[13px] text-[#272727] lg:my-5 lg:text-sm">
            <span className="h-px flex-1 bg-[#b9b9b9]" />
            <span>{copy.commonGoal}</span>
            <span className="h-px flex-1 bg-[#b9b9b9]" />
          </div>

          <div className="mx-auto grid grid-cols-2 gap-2.5 lg:max-w-[1000px] lg:grid-cols-3 lg:gap-3">
            {goalOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedGoalId === option.id;

              return (
                <button
                  aria-pressed={isSelected}
                  className={`flex min-h-[80px] items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6] lg:min-h-[76px] lg:gap-3 lg:px-3 lg:py-2.5 ${
                    isSelected
                      ? 'border-[#2458a6] bg-[#edf5ff] shadow-[0_0_0_1px_#2458a6]'
                      : 'border-[#bcbcbc] bg-white hover:border-[#7198c8] hover:bg-[#f8fbff]'
                  }`}
                  key={option.id}
                  onClick={() => {
                    setSelectedGoalId(option.id);
                    setGoalText(copy[option.translationKey]);
                    // Submit the goal automatically when clicking common goal
                    const text = goalInputTranslations.en[option.translationKey];
                    if (text) {
                      setActionNotice('');
                      setConversationText(text);
                      setFollowUpAnswer('');
                      runIntelligence(text, {
                        text,
                        state: location?.state,
                        district: location?.district,
                        language: language === 'or' ? 'od' : 'en',
                      });
                    }
                  }}
                  type="button"
                >
                  <Icon className="h-9 w-9 shrink-0 text-[#303030] lg:h-10 lg:w-10" />
                  <span className="flex-1 text-[13px] font-medium leading-[1.35] text-[#161616] lg:text-[15px]">
                    {copy[option.translationKey]}
                  </span>
                  <ChevronIcon className="h-4 w-4 shrink-0 text-[#242424]" />
                </button>
              );
            })}
          </div>

          <section className="mx-auto mt-5 max-w-[1000px] rounded-xl border border-[#d8e3ef] bg-[#f8fbff] px-4 py-3.5 text-[#263b52] lg:px-5" aria-labelledby="prototype-coverage-title">
            <h2 id="prototype-coverage-title" className="text-sm font-bold">Limitation</h2>
            <p className="mt-1 text-xs leading-5 sm:text-sm">
              A focused V1, designed around real user needs from rural India.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 sm:text-sm">
              <li>37 schemes currently covered</li>
              <li>Built around real rural user needs—for example, our initial user is a digitally capable woman managing a large goat farm alongside a business.</li>
              <li>Focused on the needs that emerge from that context: livestock, farming, crop protection, farmer support and selected small-business needs.</li>
              <li>Deeper eligibility support is available for selected schemes.</li>
              <li>Adding schemes takes real work—eligibility, documents, requirements and language support all need to be carefully structured and validated.</li>
              <li>Coverage will expand as more schemes are added and verified.</li>
            </ul>
            <p className="mt-2 text-xs font-semibold leading-5 text-[#536579] sm:text-sm">
              No match here ≠ no government support exists.
            </p>
            <p className="text-xs leading-5 text-[#536579] sm:text-sm">
              It simply means this particular need is not yet covered in our current prototype catalogue.
            </p>
          </section>

          <div className="mx-auto mt-3.5 flex max-w-[1000px] items-center gap-3 rounded-xl bg-[#eaf3ff] px-3.5 py-3 text-[#171717] lg:mt-3 lg:px-5 lg:py-3">
            <BulbIcon className="h-8 w-8 shrink-0 lg:h-9 lg:w-9" />
            <p className="text-[12px] leading-[1.45] lg:text-sm">
              {copy.reassurance}
              <br />
              {copy.reassuranceSecond}
            </p>
          </div>
        </div>

        <p aria-live="polite" className="sr-only">
          {actionNotice}
        </p>
      </section>
    </main>
  );
}
