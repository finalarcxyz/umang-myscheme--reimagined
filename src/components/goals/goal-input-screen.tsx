'use client';

import { useState, type ComponentType } from 'react';
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

interface IconProps {
  className?: string;
}

interface GoalOption {
  id: string;
  translationKey: 'business' | 'farming' | 'livestock' | 'education' | 'financial' | 'other';
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

function MicrophoneIcon({ className = 'h-7 w-7' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect x="8.5" y="3" width="7" height="12" rx="3.5" fill="currentColor" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
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

function EducationIcon({ className = 'h-10 w-10' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 48 48">
      <path d="m6 19 18-9 18 9-18 9-18-9Z" fill="currentColor" />
      <path d="M14 24v9c7 5 13 5 20 0v-9M40 20v13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <circle cx="40" cy="35.5" r="1.8" fill="currentColor" />
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

function MoreIcon({ className = 'h-10 w-10' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="24" r="2" fill="currentColor" />
      <circle cx="24" cy="24" r="2" fill="currentColor" />
      <circle cx="31" cy="24" r="2" fill="currentColor" />
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

function HeadsetIcon({ className = 'h-9 w-9' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 40 40">
      <path d="M8 23v-5a12 12 0 0 1 24 0v5M8 22H5v9h6v-8H8ZM32 22h3v9h-6v-8h3ZM29 32c-2 3-5 4-9 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      <circle cx="18" cy="36" r="1.8" fill="currentColor" />
    </svg>
  );
}

function FiltersIcon({ className = 'h-9 w-9' }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 40 40">
      <path d="M8 10h24M8 20h24M8 30h24" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <circle cx="15" cy="10" r="3" fill="white" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="26" cy="20" r="3" fill="white" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="19" cy="30" r="3" fill="white" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

const goalOptions: GoalOption[] = [
  { id: 'business', translationKey: 'business', icon: BusinessIcon },
  { id: 'farming', translationKey: 'farming', icon: FarmingIcon },
  { id: 'livestock', translationKey: 'livestock', icon: LivestockIcon },
  { id: 'education', translationKey: 'education', icon: EducationIcon },
  { id: 'financial', translationKey: 'financial', icon: FinancialIcon },
  { id: 'other', translationKey: 'other', icon: MoreIcon },
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
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState('');
  const [conversationText, setConversationText] = useState('');
  const [questionContext, setQuestionContext] = useState<QuestionSelectorContext>({});
  const [activeQuestion, setActiveQuestion] = useState<AskedQuestion | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [showOtherAnswer, setShowOtherAnswer] = useState(false);
  const [finalResult, setFinalResult] = useState<MatcherResult | null>(null);
  const copy = goalInputTranslations[language];
  const examplePhrases = language === 'or'
    ? [
        'mo business pain loan darkar',
        'nua business start karibi',
        'mo chasa ku bhala karibaku chahunchi',
        'goat farm start karibi',
      ]
    : [
        'I want a loan for my business',
        'I want to start a new business',
        'I want to improve my farming',
        'I want to start goat farming',
      ];

  function runIntelligence(text: string, context: QuestionSelectorContext) {
    const nextContext: QuestionSelectorContext = {
      ...context,
      text,
      state: context.state ?? location?.state,
      district: context.district ?? location?.district,
      language: language === 'or' ? 'od' : 'en',
    };
    const result = matchSchemes(toMatcherInput(text, nextContext));
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
          <div className="flex items-center justify-self-end text-[#222]">
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
              className="h-[86px] w-full resize-none rounded-[14px] border border-[#333] bg-white px-4 py-3 pr-14 text-[15px] leading-6 text-[#161616] outline-none transition placeholder:text-[#666] focus:border-[#205aa5] focus:ring-2 focus:ring-[#dce9f8] lg:h-[94px] lg:px-5 lg:py-3 lg:text-base"
              onChange={(event) => setGoalText(event.target.value)}
              placeholder={copy.placeholder}
              value={goalText}
            />
            <button
              aria-label="Voice input is not available yet"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-[#4a4a4a] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2458a6]"
              onClick={() => setActionNotice('Voice input is not available yet.')}
              type="button"
            >
              <MicrophoneIcon />
            </button>
          </div>

          <div className="mx-auto mt-3 flex max-w-[900px] justify-end">
            <button
              className="min-h-10 rounded-lg bg-[#0b438f] px-5 text-sm font-semibold text-white transition hover:bg-[#073975] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!goalText.trim()}
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

          <div className="mx-auto mt-3.5 max-w-[900px] rounded-[13px] border border-dashed border-[#8db4e8] px-2.5 py-2.5 lg:mt-3 lg:px-4 lg:py-2.5">
            <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
              <span className="text-[12px] font-medium text-[#4c4c4c]">{copy.examples}</span>
              {examplePhrases.map((phrase) => (
                <button
                  className="rounded-lg bg-[#f2f2f2] px-2 py-1 text-left text-[11px] leading-4 text-[#1d1d1d] transition hover:bg-[#e7eef8] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2458a6] lg:px-2.5 lg:py-1.5 lg:text-xs"
                  key={phrase}
                  onClick={() => setGoalText(phrase)}
                  type="button"
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>

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
                    const text = copy[option.translationKey];
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

          <div className="mx-auto mt-3.5 flex max-w-[1000px] items-center gap-3 rounded-xl bg-[#eaf3ff] px-3.5 py-3 text-[#171717] lg:mt-3 lg:px-5 lg:py-3">
            <BulbIcon className="h-8 w-8 shrink-0 lg:h-9 lg:w-9" />
            <p className="text-[12px] leading-[1.45] lg:text-sm">
              {copy.reassurance}
              <br />
              {copy.reassuranceSecond}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-[#d0d0d0] bg-white px-3 py-3 lg:px-16 lg:py-2.5">
          <button
            className="flex min-h-14 items-center gap-2.5 border-r border-[#d0d0d0] px-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6] lg:justify-center lg:gap-4"
            onClick={() => setActionNotice('Assistant support is not available yet.')}
            type="button"
          >
            <HeadsetIcon className="h-8 w-8 shrink-0 text-[#333]" />
            <span className="text-[12px] leading-[1.45]">
              {copy.needHelp}
              <strong className="block font-semibold">{copy.assistant}</strong>
            </span>
          </button>
          <button
            className="flex min-h-14 items-center gap-2.5 px-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2458a6] lg:justify-center lg:gap-4"
            onClick={() => setActionNotice('Scheme filters are not available yet.')}
            type="button"
          >
            <FiltersIcon className="h-8 w-8 shrink-0 text-[#333]" />
            <span className="flex-1 text-[12px] leading-[1.45]">
              {copy.findSchemes}
              <strong className="block font-semibold">{copy.filters}</strong>
            </span>
            <ChevronIcon className="h-4 w-4 shrink-0" />
          </button>
        </div>
        <p aria-live="polite" className="sr-only">
          {actionNotice}
        </p>
      </section>
    </main>
  );
}
