import catalog from './scheme_catalog.json' with { type: 'json' };
// @ts-expect-error Node's type-stripping test runner requires the explicit TypeScript extension.
import { analyzeVocabulary, normalizeUserText, type VocabularyAnalysis } from './vocabulary.ts';

export interface MatcherInput {
  text: string;
  state?: string;
  district?: string;
  age?: number;
  gender?: string;
  income?: number;
  landArea?: number;
  landStatus?: string;
  shgMember?: boolean;
  caste?: string;
  minorityStatus?: boolean;
  existingActivity?: string;
}

/** Common stopwords to ignore when guessing a business type */
const STOPWORDS = new Set([
  'a', 'an', 'the', 'my', 'our', 'your', 'his', 'her', 'its', 'we', 'they',
  'to', 'for', 'in', 'of', 'on', 'at', 'by', 'with', 'start', 'grow', 'improve',
  'business', 'loan', 'subsidy', 'help', 'support', 'need', 'want', 'can', 'would',
  'should', 'could', 'is', 'are', 'am', 'as', 'that', 'this', 'those', 'these',
  'then', 'than', 'so', 'up', 'down', 'out', 'off', 'over', 'under', 'again',
  'further', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
  'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
  'not', 'only', 'own', 'same', 'too', 'very', 'just', 'but', 'or', 'and', 'nor'
]);

/** Generic words that should not be considered as business type hints */
const GENERIC_WORDS = new Set([
  'mo', 'new', 'nua', 'some', 'any', 'each', 'every', 'all', 'no', 'none', 'many', 'much', 'few', 'several'
]);

/**
 * Attempts to guess a specific business type from the text.
 * Returns a business type noun if a pattern like "<word> business" is found
 * and the word is not a stopword and not a generic word.
 * Returns undefined if no clear business type is detectable.
 */
function guessBusinessType(text: string): string | undefined {
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i + 1] !== 'business') continue;
    const candidate = words[i];
    if (candidate.length === 0) return undefined;
    // Ignore stopwords
    if (STOPWORDS.has(candidate)) continue;
    // Ignore generic words
    if (GENERIC_WORDS.has(candidate)) continue;
    // TODO: optionally ignore known concepts (e.g., 'goat', 'fish') to avoid overriding explicit detections
    // For simplicity, we accept any non-stopword as a business type hint.
    return candidate;
  }
  return undefined;
}

export interface ExtractedIntent {
  goal?: string;
  need?: string;
  activity?: string;
  beneficiary?: string;
}

export type Relevance = 'HIGH' | 'MEDIUM' | 'LOW';
export type EligibilityStatus =
  | 'ELIGIBLE'
  | 'POTENTIALLY_ELIGIBLE'
  | 'UNKNOWN'
  | 'EXCLUDED';

export interface RankedScheme {
  id: string;
  name: string;
  score: number;
  relevance: Relevance;
  eligibilityStatus: EligibilityStatus;
  reasons: string[];
  matchedCriteria: string[];
  unknownCriteria: string[];
  followUpQuestions: string[];
}

export interface MatcherResult {
  intent: ExtractedIntent;
  missingContext: string[];
  rankedSchemes: RankedScheme[];
}

interface Scheme {
  id: string;
  name: string;
  scope: string[];
  intents_high: string[];
  intents_medium: string[];
  activities: string[];
  need_types: string[];
  keywords: string[];
  eligibility_facts: string[];
  hard_exclusions: string[];
  questions: string[];
}

interface EligibilityEvaluation {
  status: EligibilityStatus;
  contextScore: number;
  reasons: string[];
}

const schemes = catalog.schemes as Scheme[];
const weights = catalog.taxonomy.ranking.weights;
const ACTIVITY_RELATIONS: Record<string, string[]> = {
  duck_farming: ['duck_farming', 'duckery', 'duck', 'poultry', 'animal_husbandry', 'livestock'],
  fish_farming: [
    'fish_farming',
    'freshwater_fish_farming',
    'aquaculture',
    'fishery',
    'biofloc',
    'aquaculture_equipment',
  ],
  goat_farming: ['goat_farming', 'goat_rearing', 'goat', 'livestock', 'animal_rearing'],
  sheep_farming: ['sheep_farming', 'sheep', 'livestock'],
  irrigation: ['irrigation', 'crop_farming', 'horticulture', 'water_management'],
  farm_produce_marketing: [
    'farm_produce_marketing',
    'apmc_trade',
    'fpo_marketing',
    'market_infrastructure',
    'storage',
    'cold_storage',
    'post_harvest',
    'processing',
    'rural_haat',
  ],
  notified_crop_farming: ['notified_crop_farming', 'crop_farming', 'farming', 'agriculture'],
  farm_mechanization: ['farm_mechanization', 'agricultural_machinery', 'custom_hiring', 'farm_equipment'],
  artisan_trade: ['traditional_artisan_trade', 'artisan_trade', 'traditional_crafts', 'craft_activity'],
  crop_farming: ['crop_farming', 'farming', 'agriculture'],
  small_business: ['small_business', 'self_employment', 'income_generation'],
  livestock: ['livestock', 'animal_husbandry', 'animal_rearing', 'poultry'],
  poultry_farming: ['poultry', 'chicken_farming', 'livestock', 'animal_husbandry'],
  tailoring: [
    'tailoring',
    'sewing',
    'traditional_artisan_trade',
    'embroidery',
    'weaving',
    'artisan_trade',
    'traditional_crafts',
    'small_business',
  ],
  dairy: ['dairy', 'buffalo_rearing', 'livestock', 'animal_husbandry'],
  education: ['education', 'student', 'skill_training'],
};

function hasPhrase(text: string, phrase: string): boolean {
  const normalizedPhrase = normalizeText(phrase);
  return normalizedPhrase.length > 1 && ` ${text} `.includes(` ${normalizedPhrase} `);
}

export const normalizeText = normalizeUserText;

function extractIntent(text: string, input: MatcherInput, vocabulary: VocabularyAnalysis): ExtractedIntent {
  const { concepts } = vocabulary;
  const hasLoan = concepts.has('loan');
  const hasSubsidy = concepts.has('subsidy');
  const hasCropInputs = concepts.has('crop_inputs');
  const hasTraining = concepts.has('training');
  const isDuck = concepts.has('duck');
  const isFish = concepts.has('fish');
  const isGoat = concepts.has('goat');
  const isSheep = /\b(sheep|menda)\b/.test(text);
  const isIrrigation = concepts.has('irrigation');
  const isArtisan = concepts.has('artisan');
  const isBusiness = concepts.has('business');
  const isPoultry = concepts.has('poultry');
  const isTailoring = concepts.has('tailoring');
  const isStart = concepts.has('start');
  const isGrow = concepts.has('grow');
  const isImprove = concepts.has('improve');
  const isProtect = concepts.has('protect');
  const isSell = concepts.has('sell') || concepts.has('market');
  const isMachine = concepts.has('farm_machinery');
  const isPension = concepts.has('pension');
  const isInsurance = concepts.has('insurance');
  const isCropProtection = isProtect && (concepts.has('crop') || concepts.has('crop_farming'));
  const isCrop = concepts.has('crop') || concepts.has('crop_farming') || /\b(farmer|kisan)\b/.test(text);
  const hasToolkit = /\b(toolkit|tools|hand tools)\b/.test(text);
  const isWoman = /\b(woman|women|female|mahila)\b/.test(text) || normalizeText(input.gender ?? '') === 'female';

  let activity: string | undefined;
  if (isDuck) activity = 'duck_farming';
  else if (isPoultry) activity = 'poultry_farming';
  else if (isFish) activity = 'fish_farming';
  else if (isGoat) activity = 'goat_farming';
  else if (isSheep) activity = 'sheep_farming';
  else if (isIrrigation) activity = 'irrigation';
  else if (isSell && isCrop) activity = 'farm_produce_marketing';
  else if ((isInsurance || isCropProtection) && isCrop) activity = 'notified_crop_farming';
  else if (isMachine) activity = 'farm_mechanization';
  else if (isTailoring) activity = 'tailoring';
  else if (isArtisan) activity = 'artisan_trade';
  else if (concepts.has('dairy')) activity = 'dairy';
  else if (concepts.has('education')) activity = 'education';
  else if (isBusiness && !activity) {
    const guessed = guessBusinessType(vocabulary.normalizedText);
    if (guessed) activity = 'small_business';
  }
  else if (isCrop && !isBusiness) activity = 'crop_farming';

  let need: string | undefined;
  if (hasToolkit && hasLoan) need = 'toolkit_and_credit';
  else if (isPension) need = 'pension';
  else if (isInsurance) need = 'insurance';
  else if (isCropProtection) need = 'crop_protection';
  else if (hasCropInputs) need = 'crop_inputs';
  else if (hasTraining) need = 'training';
  else if (isMachine) need = 'equipment';
  else if (isSell) need = 'market_access';
  else if (hasLoan) need = 'loan';
  else if (hasSubsidy) need = 'subsidy';

  let goal: string | undefined;
  if (isPension || isInsurance || isCropProtection || isProtect) goal = 'protect_income';
  else if (isSell) goal = 'sell_or_market';
  else if (isIrrigation && hasSubsidy) goal = 'reduce_cost_or_improve_productivity';
  else if (isMachine) goal = 'improve_productivity';
  else if (isArtisan && (hasLoan || hasToolkit)) goal = 'grow_existing_activity';
  else if (isBusiness && isGrow) goal = 'grow_existing_business';
  else if (isBusiness && isStart) goal = 'start_new_business';
  else if ((isImprove || isGrow) && activity === 'crop_farming') goal = 'improve_farming';
  else if (isImprove || isGrow) goal = 'improve_productivity';
  else if (isStart) goal = 'start_new_activity';
  else if (hasLoan) goal = 'access_credit';
  else if (hasSubsidy) goal = 'access_subsidy';
  else if (isBusiness && activity) goal = 'start_new_activity';
  else if (activity && concepts.has('do_activity')) goal = 'start_new_activity';

  let beneficiary: string | undefined;
  if (isArtisan) beneficiary = 'artisan';
  else if (isWoman) beneficiary = 'woman';
  else if (/\b(farmer|kisan)\b/.test(text) || activity === 'crop_farming') beneficiary = 'farmer';
  else if (/\b(shg|self help group)\b/.test(text) || input.shgMember) beneficiary = 'shg';

  return { goal, need, activity, beneficiary };
}

function termsFor(scheme: Scheme): string[] {
  return [...scheme.intents_high, ...scheme.intents_medium, ...scheme.activities, ...scheme.need_types]
    .map((term) => normalizeText(term.replaceAll('_', ' ')));
}

function goalScore(goal: string | undefined, scheme: Scheme): number {
  if (!goal) return 0;

  const high = scheme.intents_high.join(' ');
  const medium = scheme.intents_medium.join(' ');
  const all = `${high} ${medium}`;
  const strongSignals: Record<string, RegExp> = {
    start_new_activity: /(^|_)(start|new|business|entrepreneurship)(_|$)/,
    start_new_business: /(^|_)(start|new|business|entrepreneurship)(_|$)/,
    grow_existing_activity: /(^|_)(grow|business|income|productivity|support|credit)(_|$)/,
    grow_existing_business: /(^|_)(grow|business|income|productivity|support|credit)(_|$)/,
    protect_income: /(^|_)(insurance|pension|security|protection|risk|loss)(_|$)/,
    reduce_cost_or_improve_productivity: /(^|_)(irrigation|water|productivity|reduce|equipment|mechanization)(_|$)/,
    improve_productivity: /(^|_)(productivity|equipment|mechanization|machinery|technology)(_|$)/,
    improve_farming: /(^|_)(farming|farm|productivity|seed|input|irrigation|equipment|technology)(_|$)/,
    access_credit: /(^|_)(credit|finance|financing|loan|working_capital)(_|$)/,
    access_subsidy: /(^|_)(subsidy|support|assistance)(_|$)/,
    sell_or_market: /(^|_)(sell|market|marketing|price|trade)(_|$)/,
  };
  const signal = strongSignals[goal];
  if (!signal) return 0;
  if (scheme.intents_high.some((intent) => signal.test(intent))) return weights.intent_match;
  if (scheme.intents_medium.some((intent) => signal.test(intent))) return 30;

  if ((goal === 'start_new_activity' || goal === 'start_new_business') && /livelihood|allied_activity_support/.test(all)) return 24;
  if ((goal === 'start_new_activity' || goal === 'start_new_business') && /equipment|improve/.test(all)) return 18;
  if (goal === 'improve_productivity' && scheme.activities.includes('farm_equipment')) return 30;
  if (goal === 'sell_or_market' && scheme.need_types.includes('market_access')) return 30;
  if (goal === 'access_credit' && scheme.need_types.some((need) => /loan|credit|finance/.test(need))) return 32;
  return 0;
}

function activityScore(activity: string | undefined, scheme: Scheme): { score: number; specificity: number } {
  if (!activity) return { score: 0, specificity: 0 };
  const related = ACTIVITY_RELATIONS[activity] ?? [activity];
  const normalizedActivities = scheme.activities.map((value) => normalizeText(value.replaceAll('_', ' ')).replaceAll(' ', '_'));
  const exact = normalizedActivities.includes(activity);
  if (exact) return { score: weights.activity_match, specificity: 3 };

  const relatedIndex = normalizedActivities.reduce((best, value) => {
    const index = related.indexOf(value);
    return index >= 0 ? Math.min(best, index) : best;
  }, Number.POSITIVE_INFINITY);
  if (Number.isFinite(relatedIndex)) {
    return { score: relatedIndex <= 2 ? 22 : 18, specificity: relatedIndex <= 2 ? 2 : 1 };
  }

  return { score: 0, specificity: 0 };
}

function isComponentMismatch(activity: string | undefined, scheme: Scheme): boolean {
  if (!activity) return false;
  if (scheme.id === 'acandabc' && activity !== 'farm_mechanization') return true;

  const schemeTerms = termsFor(scheme).join(' ');
  if (
    activity === 'duck_farming' &&
    /buffalo|dairy/.test(schemeTerms) &&
    !/duck|poultry/.test(schemeTerms)
  ) {
    return true;
  }
  if (activity === 'poultry_farming' && /buffalo|dairy/.test(schemeTerms) && !/poultry/.test(schemeTerms)) {
    return true;
  }
  if (activity === 'goat_farming' && /buffalo|dairy/.test(schemeTerms) && !/goat|sheep/.test(schemeTerms)) {
    return true;
  }
  if (
    activity === 'tailoring' &&
    !/tailor|sewing|embroider|weaving|artisan|traditional craft/.test(schemeTerms)
  ) {
    return true;
  }
  return false;
}

function needScore(need: string | undefined, scheme: Scheme): number {
  if (!need) return 0;
  const needs = scheme.need_types.map((value) => normalizeText(value.replaceAll('_', ' ')).replaceAll(' ', '_'));
  if (need === 'toolkit_and_credit') {
    return needs.some((value) => /toolkit/.test(value)) && needs.some((value) => /credit|loan/.test(value))
      ? weights.need_match
      : 0;
  }
  if (needs.includes(need)) return weights.need_match;
  if (need === 'loan' && needs.some((value) => /credit|finance|microfinance/.test(value))) return weights.need_match;
  if (need === 'subsidy' && needs.some((value) => /subsidy|financial_assistance|capital_subsidy/.test(value))) {
    return weights.need_match;
  }
  if (need === 'crop_inputs' && needs.some((value) => /inputs|seed_support|seed|subsidy/.test(value))) {
    return weights.need_match;
  }
  if (need === 'crop_protection' && needs.some((value) => /insurance|risk_protection|farm_support/.test(value))) {
    return weights.need_match;
  }
  return 0;
}

function locationScore(input: MatcherInput, scheme: Scheme): { score: number; excluded: boolean; reason?: string } {
  if (!input.state) return { score: 0, excluded: false };
  const state = normalizeText(input.state);
  const scopes = scheme.scope.map(normalizeText);
  if (scopes.some((scope) => scope === state || scope === 'india')) {
    return { score: weights.location_match, excluded: false, reason: `Location scope includes ${input.state}.` };
  }

  const stateOnlyScopes = scopes.filter((scope) => ['odisha', 'chhattisgarh'].includes(scope));
  if (stateOnlyScopes.length > 0) {
    return { score: 0, excluded: true, reason: `Scheme is limited to ${scheme.scope.join(', ')}.` };
  }
  return { score: 0, excluded: false };
}

function displayTerm(value: string): string {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function matchedGoalIntent(intent: ExtractedIntent, scheme: Scheme): string | undefined {
  const intents = [...scheme.intents_high, ...scheme.intents_medium];
  const activityWords = (intent.activity ?? '').split('_').filter((word) => word.length > 3);
  return intents.find((value) => activityWords.some((word) => value.includes(word))) ?? intents[0];
}

function buildMatchedCriteria(
  input: MatcherInput,
  intent: ExtractedIntent,
  scheme: Scheme,
  intentPoints: number,
  activityPoints: number,
  needPoints: number,
  locationPoints: number,
  eligibilityReasons: string[]
): string[] {
  const criteria: string[] = [];
  const goalIntent = matchedGoalIntent(intent, scheme);
  if (intentPoints > 0 && intent.goal && goalIntent) {
    criteria.push(`Goal: ${displayTerm(intent.goal)} matches catalog intent ${displayTerm(goalIntent)}.`);
  }
  if (activityPoints > 0 && intent.activity) {
    const supported = scheme.activities.slice(0, 2).map(displayTerm).join(' and ');
    criteria.push(`Activity: ${displayTerm(intent.activity)} matches catalog activities (${supported}).`);
  }
  if (needPoints > 0 && intent.need) {
    criteria.push(`Need: ${displayTerm(intent.need)} matches catalog support (${scheme.need_types.slice(0, 3).map(displayTerm).join(', ')}).`);
  }
  if (locationPoints > 0 && input.state) {
    criteria.push(`Location: ${input.state} is within the scheme's cataloged scope (${scheme.scope.join(', ')}).`);
  }
  criteria.push(...eligibilityReasons);
  return criteria;
}

function buildUnknownCriteria(input: MatcherInput, scheme: Scheme): string[] {
  const facts = [...scheme.eligibility_facts, ...scheme.hard_exclusions].join(' ').toLowerCase();
  const unknown = new Set<string>();

  if (/\bage\b/.test(facts) && input.age === undefined) unknown.add('Age requirement has not been checked.');
  if (/income|economic status/.test(facts) && input.income === undefined) unknown.add('Income requirement has not been checked.');
  if (/landholding|land area|hectare|land records|qualifying land|land\/site/.test(facts)) {
    if (input.landArea === undefined) unknown.add('Land-area requirement has not been checked.');
    if (input.landStatus === undefined) unknown.add('Land-status requirement has not been checked.');
  }
  if (/women|woman|female|male applicant/.test(facts) && input.gender === undefined) {
    unknown.add('Gender-based eligibility has not been checked.');
  }
  if (/scheduled caste|\bsc\b|\bst\b|\bobc\b/.test(facts) && input.caste === undefined) {
    unknown.add('Caste/category requirement has not been checked.');
  }
  if (/minority communit/.test(facts) && input.minorityStatus === undefined) {
    unknown.add('Minority-status requirement has not been checked.');
  }
  if (/previous|prior|already received|past 5 years|last five years/.test(facts)) {
    unknown.add('Prior subsidy or loan history has not been checked.');
  }
  if (/project size|\bunit\b|\btanks?\b|\bpalms?\b/.test(facts)) {
    unknown.add('Project or unit-size requirement has not been checked.');
  }
  if (scheme.scope.some((scope) => /district/i.test(scope))) {
    unknown.add('District-level scheme availability must be confirmed from the catalog source.');
  }
  if (!input.state && scheme.scope.some((scope) => /^(Odisha|Chhattisgarh)$/i.test(scope))) {
    unknown.add('State eligibility has not been checked.');
  }

  return [...unknown].slice(0, 5);
}

function buildReasons(
  input: MatcherInput,
  intent: ExtractedIntent,
  scheme: Scheme,
  intentPoints: number,
  activityPoints: number,
  needPoints: number,
  locationPoints: number
): string[] {
  const reasons: string[] = [];
  if (activityPoints > 0) {
    reasons.push(`Supports ${scheme.activities.slice(0, 2).map((value) => displayTerm(value).toLowerCase()).join(' and ')}.`);
  }
  const goalIntent = matchedGoalIntent(intent, scheme);
  if (intentPoints > 0 && goalIntent) reasons.push(`Catalog intent includes ${displayTerm(goalIntent).toLowerCase()}.`);
  if (needPoints > 0) reasons.push(`Provides ${scheme.need_types.slice(0, 3).map((value) => displayTerm(value).toLowerCase()).join(', ')} support.`);
  if (locationPoints > 0 && input.state) reasons.push(`Available within the cataloged scope for ${input.state}.`);
  return reasons;
}

function evaluateEligibility(input: MatcherInput, intent: ExtractedIntent, scheme: Scheme): EligibilityEvaluation {
  const location = locationScore(input, scheme);
  if (location.excluded || scheme.id === 'visvasi') {
    return {
      status: 'EXCLUDED',
      contextScore: 0,
      reasons: [location.reason ?? 'Catalog marks this scheme as unavailable for matching.'],
    };
  }

  const facts = [...scheme.eligibility_facts, ...scheme.hard_exclusions].map(normalizeText);
  const reasons: string[] = [];
  let knownChecks = 0;
  let matchedChecks = 0;

  const exclude = (reason: string): EligibilityEvaluation => ({
    status: 'EXCLUDED',
    contextScore: 0,
    reasons: [reason],
  });

  if (input.age !== undefined) {
    const ranges = facts.flatMap((fact) => [...fact.matchAll(/age\s*(\d+)\s+(?:to\s+)?(\d+)/g)]);
    for (const match of ranges) {
      knownChecks += 1;
      const minimum = Number(match[1]);
      const maximum = Number(match[2]);
      if (input.age < minimum || input.age > maximum) return exclude(`Age is outside the cataloged ${minimum}–${maximum} range.`);
      matchedChecks += 1;
    }
    const minimumAges = facts.flatMap((fact) => [...fact.matchAll(/age\s*>?=\s*(\d+)/g)]);
    for (const match of minimumAges) {
      knownChecks += 1;
      const minimum = Number(match[1]);
      if (input.age < minimum) return exclude(`Age is below the cataloged minimum of ${minimum}.`);
      matchedChecks += 1;
    }
  }

  if (input.income !== undefined) {
    const thresholds = facts.flatMap((fact) => [...fact.matchAll(/income\s*(?:<|below)\s*₹?\s*(\d+(?:\.\d+)?)\s*(lakh)?/g)]);
    for (const match of thresholds) {
      knownChecks += 1;
      const threshold = Number(match[1]) * (match[2] ? 100_000 : 1);
      if (input.income >= threshold) return exclude(`Income is at or above the cataloged threshold of ₹${threshold}.`);
      matchedChecks += 1;
    }
  }

  const gender = normalizeText(input.gender ?? '');
  if (gender) {
    if (facts.some((fact) => /female|women|woman/.test(fact))) {
      knownChecks += 1;
      if (gender === 'male' && facts.some((fact) => /male applicants|qualifying woman|targeted women/.test(fact))) {
        return exclude('Catalog restricts this scheme to women applicants.');
      }
      if (gender === 'female') matchedChecks += 1;
    }
  }

  if (input.caste) {
    const caste = normalizeText(input.caste);
    if (facts.some((fact) => /scheduled caste|\bsc\b/.test(fact))) {
      knownChecks += 1;
      if (!/scheduled caste|\bsc\b/.test(caste)) return exclude('Catalog restricts this scheme to Scheduled Caste applicants.');
      matchedChecks += 1;
    }
  }

  if (input.minorityStatus !== undefined && facts.some((fact) => /minority communit/.test(fact))) {
    knownChecks += 1;
    if (!input.minorityStatus && facts.some((fact) => /not meeting applicable community|six notified minority/.test(fact))) {
      return exclude('Catalog requires membership in a notified minority community for this component.');
    }
    if (input.minorityStatus) matchedChecks += 1;
  }

  if (input.landArea !== undefined) {
    const ceilings = facts.flatMap((fact) => [...fact.matchAll(/(?:up to|ceiling)\s*(\d+(?:\.\d+)?)\s*hectare/g)]);
    for (const match of ceilings) {
      knownChecks += 1;
      const maximum = Number(match[1]);
      if (input.landArea > maximum) return exclude(`Land area exceeds the cataloged ${maximum}-hectare limit.`);
      matchedChecks += 1;
    }
  }

  if (intent.beneficiary && termsFor(scheme).some((term) => term.includes(intent.beneficiary!.replaceAll('_', ' ')))) {
    matchedChecks += 1;
    reasons.push(`Beneficiary context matches ${intent.beneficiary}.`);
  }

  const contextScore = Math.min(weights.known_context_match, matchedChecks * 2);
  const hasUnresolvedEligibility = scheme.eligibility_facts.length > knownChecks || scheme.hard_exclusions.length > 0;
  return {
    status: hasUnresolvedEligibility ? (matchedChecks > 0 ? 'POTENTIALLY_ELIGIBLE' : 'UNKNOWN') : 'ELIGIBLE',
    contextScore,
    reasons,
  };
}

function relevanceFor(score: number): Relevance | undefined {
  if (score >= 80) return 'HIGH';
  if (score >= 60) return 'MEDIUM';
  if (score >= 40) return 'LOW';
  return undefined;
}

function missingContextFor(intent: ExtractedIntent): string[] {
  const missing: string[] = [];
  if (
    !intent.activity &&
    ['access_credit', 'start_new_business', 'grow_existing_business'].includes(intent.goal ?? '')
  ) {
    missing.push('business_activity');
  } else if (!intent.activity) {
    missing.push('activity');
  }
  if (!intent.goal) missing.push('goal');
  return missing;
}

export function matchSchemes(input: MatcherInput): MatcherResult {
  const vocabulary = analyzeVocabulary(input.text);
  const text = vocabulary.normalizedText;
  const intent = extractIntent(text, input, vocabulary);
  const missingContext = missingContextFor(intent);

  if (!text) {
    return { intent, missingContext, rankedSchemes: [] };
  }

  // If activity is missing for certain goals, we cannot match any scheme meaningfully.
  // Ask for the specific missing context (business activity) instead of showing irrelevant matches.
  if (
    !intent.activity &&
    ['access_credit', 'start_new_business', 'grow_existing_business'].includes(intent.goal ?? '')
  ) {
    return { intent, missingContext, rankedSchemes: [] };
  }

  const scored = schemes.flatMap((scheme) => {
    if (isComponentMismatch(intent.activity, scheme)) return [];
    const activity = activityScore(intent.activity, scheme);
    const intentPoints = intent.activity && activity.score === 0 ? 0 : goalScore(intent.goal, scheme);
    const needPoints = needScore(intent.need, scheme);
    const location = locationScore(input, scheme);
    const eligibility = evaluateEligibility(input, intent, scheme);

    if (eligibility.status === 'EXCLUDED') return [];

    const score = Math.min(
      100,
      intentPoints + activity.score + needPoints + location.score + eligibility.contextScore
    );
    const relevance = relevanceFor(score);
    if (!relevance) return [];

    const reasons = buildReasons(
      input,
      intent,
      scheme,
      intentPoints,
      activity.score,
      needPoints,
      location.score
    );
    const matchedCriteria = buildMatchedCriteria(
      input,
      intent,
      scheme,
      intentPoints,
      activity.score,
      needPoints,
      location.score,
      eligibility.reasons
    );
    const unknownCriteria = buildUnknownCriteria(input, scheme);

    return [{ scheme, score, relevance, reasons, matchedCriteria, unknownCriteria, eligibility, specificity: activity.specificity }];
  });

  scored.sort(
    (left, right) =>
      right.score - left.score ||
      right.specificity - left.specificity ||
      Number(right.scheme.scope.some((scope) => normalizeText(scope) === normalizeText(input.state ?? ''))) -
        Number(left.scheme.scope.some((scope) => normalizeText(scope) === normalizeText(input.state ?? ''))) ||
      left.scheme.id.localeCompare(right.scheme.id)
  );

  let questionsRemaining = 2;
  const rankedSchemes = scored.slice(0, 5).map(
    ({ scheme, score, relevance, reasons, matchedCriteria, unknownCriteria, eligibility }) => {
    const followUpQuestions = scheme.questions.slice(0, questionsRemaining);
    questionsRemaining -= followUpQuestions.length;
    return {
      id: scheme.id,
      name: scheme.name,
      score,
      relevance,
      eligibilityStatus: eligibility.status,
      reasons,
      matchedCriteria,
      unknownCriteria,
      followUpQuestions,
    };
    }
  );

  return { intent, missingContext, rankedSchemes };
}
