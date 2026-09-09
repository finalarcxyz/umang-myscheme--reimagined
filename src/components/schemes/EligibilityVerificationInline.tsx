'use client';

import { useState, useMemo } from 'react';
import type { LanguageCode } from '@/lib/language/language';
import {
  evaluateEligibility,
  type MatcherInput,
  type EligibilityStatus,
  type Scheme,
  type SchemeEligibilityAnswer,
  type SchemeEligibilityAnswers
} from '@/lib/schemes/matcher';
import { catalog, eligibilityCatalog } from '@/lib/schemes/loader';

interface EligibilityVerificationInlineProps {
  schemeId: string;
  language: LanguageCode;
  location?: { state: string; district: string };
  matcherInput?: Partial<MatcherInput>; // Pre-filled information from user's journey
}

interface StructuredEligibilityCriterion {
  type: 'range' | 'threshold' | 'enum' | 'exclusion' | 'boolean_required' | 'info_only' | 'manual_verification_note';
  field?: string;
  derived_from?: string;
  min?: number | null;
  max?: number | null;
  allowed?: SchemeEligibilityAnswer[];
  unit?: string;
  question?: Record<LanguageCode, string>;
}

interface StructuredEligibilityRecord {
  id: string;
  criteria: StructuredEligibilityCriterion[];
}

interface EligibilityQuestion {
  id: string;
  question: string;
  field: string;
  inputType: 'number' | 'select';
  options?: Array<{ value: SchemeEligibilityAnswer; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
}

function inputDefaultValue(value: SchemeEligibilityAnswer | undefined): string | number {
  return typeof value === 'number' && Number.isNaN(value) ? '' : typeof value === 'boolean' ? '' : value ?? '';
}

export default function EligibilityVerificationInline({
  schemeId,
  language,
  location,
  matcherInput = {}
}: EligibilityVerificationInlineProps) {
  // Get the scheme data from the catalog
  const scheme = useMemo(() => {
    return (catalog.schemes as Scheme[]).find((candidate) => candidate.id === schemeId) ?? null;
  }, [schemeId]);

  const [step, setStep] = useState<'questions' | 'result'>('questions');
  const [answers, setAnswers] = useState<SchemeEligibilityAnswers>({});
  const [answeredFields, setAnsweredFields] = useState<Set<string>>(() => new Set());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [numericAnswer, setNumericAnswer] = useState('');
  const [eligibilityResult, setEligibilityResult] = useState<{
    status: EligibilityStatus;
    reasons: string[];
    details: {
      satisfied: string[];
      notSatisfied: string[];
      missing: string[];
      needsVerification: string[];
    }
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Combine matcherInput with answers, with answers taking precedence
  const combinedInput = useMemo(() => ({
    ...matcherInput,
    ...answers
  }), [matcherInput, answers]);

  // Build a stable question list from the structured criteria. Answers never remove or reorder questions.
  const requiredQuestions: EligibilityQuestion[] = useMemo(() => {
    if (!scheme) return [];

    const eligibilityRecord = (
      eligibilityCatalog as unknown as Record<string, StructuredEligibilityRecord>
    )[scheme.id];
    if (!eligibilityRecord) return [];

    const seenFields = new Set<string>();
    return eligibilityRecord.criteria.flatMap((criterion, index) => {
      if (!criterion.field || criterion.derived_from || !criterion.question) return [];
      if (criterion.type === 'info_only' || criterion.type === 'manual_verification_note') return [];
      if (seenFields.has(criterion.field)) return [];
      seenFields.add(criterion.field);

      const isNumeric = criterion.type === 'range' || criterion.type === 'threshold';
      const isBoolean = criterion.type === 'boolean_required' || criterion.type === 'exclusion';
      const options = isBoolean
        ? [
            { value: true, label: language === 'or' ? 'ହଁ' : 'Yes' },
            { value: false, label: language === 'or' ? 'ନା' : 'No' },
          ]
        : criterion.type === 'enum'
          ? (criterion.allowed ?? []).map((value) => ({
              value,
              label: String(value).replaceAll('_', ' '),
            }))
          : undefined;

      return [{
        id: `${scheme.id}:${criterion.field}:${index}`,
        question: criterion.question[language],
        field: criterion.field,
        inputType: isNumeric ? 'number' : 'select',
        options,
        min: criterion.min ?? undefined,
        max: criterion.max ?? undefined,
        step: criterion.unit === 'INR/year' ? 1000 : criterion.unit === 'hectare' ? 0.1 : 1,
        unit: criterion.unit,
        placeholder: language === 'or' ? 'ଆପଣଙ୍କ ଉତ୍ତର ଲେଖନ୍ତୁ' : 'Enter your answer',
      }];
    });
  }, [scheme, language]);

  const currentQuestion = requiredQuestions[currentQuestionIndex];

  // Handle answering a question
  const handleAnswer = (value: SchemeEligibilityAnswer) => {
    if (!currentQuestion) return;

    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.field]: value
    }));
    setAnsweredFields((previous) => {
      const next = new Set(previous);
      next.add(currentQuestion.field);
      return next;
    });
    setNumericAnswer('');

    if (currentQuestionIndex < requiredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions answered, evaluate eligibility
      evaluateEligibilityForScheme();
    }
  };

  const submitNumericAnswer = () => {
    const value = Number(numericAnswer);
    if (!currentQuestion || !numericAnswer.trim() || Number.isNaN(value)) return;
    handleAnswer(value);
  };

  // Evaluate eligibility using the matcher's logic
  const evaluateEligibilityForScheme = () => {
    if (!scheme) return;
    setLoading(true);

    // Create matcher input with our collected answers plus location
    const matcherInputForEval: MatcherInput = {
      text: "Checking eligibility for " + (scheme?.name || schemeId),
      state: location?.state,
      district: location?.district,
      age: typeof combinedInput.age === 'number' ? combinedInput.age : undefined,
      gender: typeof combinedInput.gender === 'string' ? combinedInput.gender : undefined,
      income: typeof combinedInput.income === 'number' ? combinedInput.income : undefined,
      landArea: typeof combinedInput.landArea === 'number' ? combinedInput.landArea : undefined,
      landStatus: typeof combinedInput.landStatus === 'string' ? combinedInput.landStatus : undefined,
      shgMember: typeof combinedInput.shgMember === 'boolean' ? combinedInput.shgMember : undefined,
      caste: typeof combinedInput.caste === 'string' ? combinedInput.caste : undefined,
      minorityStatus: typeof combinedInput.minorityStatus === 'boolean' ? combinedInput.minorityStatus : undefined,
      existingActivity: typeof combinedInput.existingActivity === 'string' ? combinedInput.existingActivity : undefined,
      priorSubsidy: typeof combinedInput.priorSubsidy === 'boolean' ? combinedInput.priorSubsidy : undefined,
      priorLoan: typeof combinedInput.priorLoan === 'boolean' ? combinedInput.priorLoan : undefined,
      pondStatus: typeof combinedInput.pondStatus === 'string' ? combinedInput.pondStatus : undefined,
      projectSize: typeof combinedInput.projectSize === 'number' ? combinedInput.projectSize : undefined,
      aadhaar: typeof combinedInput.aadhaar === 'boolean' ? combinedInput.aadhaar : undefined
    };

    // Eligibility is driven by structured criteria; scheme-name text must not fabricate intent context.
    const matcherResult = evaluateEligibility(matcherInputForEval, {}, scheme, answers);

    // Transform matcher result to match expected format
    // The matcher returns reasons as an array of strings, but doesn't categorize them
    // We'll map them to appropriate categories based on the eligibility status
    const transformedResult: {
      status: EligibilityStatus;
      reasons: string[];
      details: {
        satisfied: string[];
        notSatisfied: string[];
        missing: string[];
        needsVerification: string[];
      }
    } = {
      status: matcherResult.status,
      reasons: matcherResult.reasons,
      details: {
        satisfied: matcherResult.status === 'ELIGIBLE' ? matcherResult.reasons : [],
        notSatisfied: matcherResult.status === 'EXCLUDED' ? matcherResult.reasons : [],
        missing: [],
        needsVerification: []
      }
    };

    // Add contextual information for non-ELIGIBLE statuses
    if (matcherResult.status === 'POTENTIALLY_ELIGIBLE') {
      transformedResult.details.needsVerification = [
        'Some eligibility criteria require additional verification'
      ];
    } else if (matcherResult.status === 'UNKNOWN') {
      transformedResult.details.missing = [
        'Eligibility assessment could not be completed due to missing information'
      ];
    }

    setEligibilityResult(transformedResult);
    setLoading(false);
    setStep('result');
  };

  // Handle going back to questions
  const handleBackToQuestions = () => {
    const previousQuestionIndex = Math.max(0, currentQuestionIndex - 1);
    const previousQuestion = requiredQuestions[previousQuestionIndex];
    setNumericAnswer(
      previousQuestion?.inputType === 'number'
        ? String(inputDefaultValue(answers[previousQuestion.field]))
        : ''
    );
    setCurrentQuestionIndex(previousQuestionIndex);
  };

  // Render loading state
  if (!scheme) {
    return (
      <div className="p-4">
        <p className="text-center text-gray-500">
          {language === 'or' ? 'ଯୋଜନା ନହିଁ ମିଳିଲା।' : 'Scheme not found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {step === 'questions' && (
        <>
          <h2 className="text-xl font-bold mb-4">
            {language === 'or' ? 'ଯୋଜନା ଯୋଗ୍ୟତା ଯାଞ୍ଚ କରନ୍ତୁ' : 'Check Eligibility'}
          </h2>

          {currentQuestion && (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="mb-4 flex items-start justify-between gap-3">
                <p className="text-lg font-semibold">{currentQuestion.question}</p>
                {answeredFields.has(currentQuestion.field) ? (
                  <span className="shrink-0 text-xs font-semibold text-green-700">
                    ✓ {language === 'or' ? 'ଉତ୍ତର ଦିଆଯାଇଛି' : 'Answered'}
                  </span>
                ) : null}
              </div>

              {currentQuestion.options ? (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option.value)}
                      aria-pressed={answers[currentQuestion.field] === option.value}
                      className={`w-full text-left border rounded-lg px-4 py-3 hover:bg-gray-50
                        ${answers[currentQuestion.field] === option.value ? 'border-blue-500 bg-blue-50' : ''}
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <input
                    key={currentQuestion.id}
                    type={currentQuestion.inputType === 'number' ? 'number' : 'text'}
                    value={numericAnswer}
                    placeholder={currentQuestion.placeholder || (language === 'or' ? 'ତଥ୍ୟ ଧାରଣ କରନ୍ତୁ' : 'Enter your answer')}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={currentQuestion.min}
                    max={currentQuestion.max}
                    step={currentQuestion.step}
                    onChange={(event) => setNumericAnswer(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        submitNumericAnswer();
                      }
                    }}
                  />
                  {currentQuestion.unit && (
                    <span className="ml-2 text-sm text-gray-500">{currentQuestion.unit}</span>
                  )}
                </div>
              )}

              <div className="mt-4 flex justify-between">
                <button
                  onClick={handleBackToQuestions}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={currentQuestionIndex === 0}
                >
                  {language === 'or' ? 'ପିଛି' : 'Back'}
                </button>

                <button
                  onClick={currentQuestion.inputType === 'number' ? submitNumericAnswer : () => handleAnswer('')}
                  disabled={currentQuestion.inputType === 'number' ? !numericAnswer.trim() || Number.isNaN(Number(numericAnswer)) : !currentQuestion.options}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {language === 'or' ? 'ସମାଧାନ' : 'Submit'}
                </button>
              </div>
            </div>
          )}

          {!currentQuestion && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {language === 'or' ? 'ଅନ୍ୟ ପ୍ରଶ୍ନ ନାହିଁ' : 'No more questions'}
              </p>
              <button
                onClick={evaluateEligibilityForScheme}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {loading
                  ? language === 'or'
                    ? 'ପ୍ରୋସେସ୍ ଚାଲୁଛି...'
                    : 'Processing...'
                  : language === 'or'
                  ? 'ଯୋଗ୍ୟତା ମୂଲ୍ୟାଙ୍କିତ କରନ୍ତୁ'
                  : 'Evaluate Eligibility'}
              </button>
            </div>
          )}
        </>
      )}

      {step === 'result' && eligibilityResult && (
        <>
          <h2 className="text-xl font-bold mb-4">
            {language === 'or' ? 'ପରିଣାମ' : 'Eligibility Result'}
          </h2>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                eligibilityResult.status === 'ELIGIBLE' ? 'bg-green-100 text-green-800' :
                eligibilityResult.status === 'POTENTIALLY_ELIGIBLE' ? 'bg-yellow-100 text-yellow-800' :
                eligibilityResult.status === 'EXCLUDED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {eligibilityResult.status === 'ELIGIBLE' ? '✓' :
                 eligibilityResult.status === 'POTENTIALLY_ELIGIBLE' ? '⚠' : '✗'}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold">
                  {eligibilityResult.status === 'ELIGIBLE' ?
                    (language === 'or' ? 'ଯୋଗ୍ୟ' : 'Eligible') :
                  eligibilityResult.status === 'POTENTIALLY_ELIGIBLE' ?
                    (language === 'or' ? 'ସମ୍୭ାବ୍ୟରେ ଯୋଗ୍ୟ' : 'Potentially Eligible') :
                    (language === 'or' ? 'ଯୋଗ୍ୟ ନାହିଁ' : 'Not Eligible')}
                </h3>
                <p className="text-gray-600">
                  {eligibilityResult.status === 'ELIGIBLE' ?
                    (language === 'or' ? 'ଆପଣ ଏହି ଯୋଜନାର ଯୋଗ୍ୟତା ରଖନ୍ତୁ' : 'You appear to meet the requirements') :
                  eligibilityResult.status === 'POTENTIALLY_ELIGIBLE' ?
                    (language === 'or' ? 'କେବଳ କେବଳ ଯେଟିକି ଜାଣିବାକୁ ପାଇଁ' : 'More information needed for final determination') :
                    (language === 'or' ? 'ଆପଣ ଏହି ଯୋଜନାର ଯୋଗ୍ୟତା ନାହିଁ' : 'You do not appear to meet the requirements')}
                </p>
              </div>
            </div>

            {/* Detailed breakdown */}
            <div className="space-y-4">
              {eligibilityResult.details.satisfied.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-green-800">
                    {language === 'or' ? 'ପୂର୍ଣ୍ଣ କ୍ରିଟେରିଆ' : 'Criteria Met ✅'}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-green-700">
                    {eligibilityResult.details.satisfied.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {eligibilityResult.details.notSatisfied.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-red-800">
                    {language === 'or' ? 'ଅପୂର୍ଣ୍ଣ କ୍ରିଟେରିଆ' : 'Criteria Not Met ❌'}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-red-700">
                    {eligibilityResult.details.notSatisfied.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {eligibilityResult.details.missing.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-yellow-800">
                    {language === 'or' ? 'ଥାହାଇଛି ଜାଣାପାରିବାକି' : 'Information Needed ❓'}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700">
                    {eligibilityResult.details.missing.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {eligibilityResult.details.needsVerification.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-blue-800">
                    {language === 'or' ? 'ପରିକ୍ଷାକୁ ଦରକାର' : 'Needs Verification 🔍'}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    {eligibilityResult.details.needsVerification.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setStep('questions');
                setCurrentQuestionIndex(0);
                setAnswers({});
                setAnsweredFields(new Set());
                setEligibilityResult(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {language === 'or' ? 'ପୁନଃାରମ୍ଭ କରନ୍ତୁ' : 'Try Again'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
