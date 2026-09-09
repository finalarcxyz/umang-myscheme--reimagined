import { catalog, eligibilityCatalog } from './loader.ts';

import schemeDetails from './scheme_details.json' with { type: 'json' };
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
  priorSubsidy?: boolean;
  priorLoan?: boolean;
  pondStatus?: string;
  projectSize?: number;
  aadhaar?: boolean;
  /** @deprecated Structured eligibility uses scheme-specific answers instead. */
  education?: string;
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
  'mo', 'new', 'nua', 'some', 'any', 'each', 'every', 'all', 'no', 'none', 'many', 'much', 'few', 'several',
  'start', 'improve', 'grow', 'want', 'need', 'help', 'support'
]);

export interface ExtractedIntent {
  goal?: string;
  need?: string;
  activity?: string;
  beneficiary?: string;
  rawActivityHint?: string;
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
  matchTier: MatchTier;
  rawActivityHint?: string;
}

export type MatchTier = 'exact' | 'closest' | 'none';

export interface Scheme {
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

export interface EligibilityEvaluation {
  status: EligibilityStatus;
  contextScore: number;
  reasons: string[];
}

export type SchemeEligibilityAnswer = string | number | boolean;

/** Answers collected for one scheme-verification session. Reset this record when the scheme changes. */
export type SchemeEligibilityAnswers = Record<string, SchemeEligibilityAnswer>;

type EligibilityCriterionType =
  | 'range'
  | 'threshold'
  | 'enum'
  | 'exclusion'
  | 'boolean_required'
  | 'info_only'
  | 'manual_verification_note';

interface EligibilityCriterion {
  source_text: string;
  type: EligibilityCriterionType;
  field?: string;
  derived_from?: 'location.state' | 'scheme_details.sourceStatus';
  min?: number | null;
  max?: number | null;
  min_inclusive?: boolean;
  max_inclusive?: boolean;
  allowed?: SchemeEligibilityAnswer[];
  required?: boolean;
  operator?: 'equals' | 'in';
  value?: SchemeEligibilityAnswer;
  values?: SchemeEligibilityAnswer[];
}

interface StructuredEligibilityRecord {
  id: string;
  criteria: EligibilityCriterion[];
}

interface SchemeDetailStatus {
  id: string;
  sourceStatus: string;
}

const schemes = catalog.schemes as Scheme[];
const structuredEligibilityById = eligibilityCatalog as unknown as Record<string, StructuredEligibilityRecord>;
const schemeDetailStatusById = new Map(
  (schemeDetails.schemes as SchemeDetailStatus[]).map((scheme) => [scheme.id, scheme.sourceStatus])
);
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

function normalizeActivityTerm(value: string): string {
  return normalizeUserText(value).replaceAll(' ', '_');
}

const supportedActivityTerms = new Set([
  ...Object.keys(ACTIVITY_RELATIONS),
  ...schemes.flatMap((scheme) => scheme.activities),
].map(normalizeActivityTerm));

const activityAliases = new Map<string, string>();
for (const [canonical, aliases] of Object.entries(ACTIVITY_RELATIONS)) {
  const normalizedCanonical = normalizeActivityTerm(canonical);
  if (!supportedActivityTerms.has(normalizedCanonical)) continue;
  activityAliases.set(normalizedCanonical, normalizedCanonical);
  for (const alias of aliases) {
    const normalizedAlias = normalizeActivityTerm(alias);
    if (!activityAliases.has(normalizedAlias)) activityAliases.set(normalizedAlias, normalizedCanonical);
  }
}
for (const term of supportedActivityTerms) {
  if (!activityAliases.has(term)) activityAliases.set(term, term);
}

const ACTIVITY_MARKERS = new Set(['business', 'farm', 'farming', 'activity', 'enterprise', 'shop', 'store']);

/** Resolve only catalogue-backed activity terms; unknown terms remain a raw hint. */
export function resolveActivity(candidateTerm: string): { activity?: string; rawActivityHint?: string } {
  const normalized = normalizeActivityTerm(candidateTerm);
  if (!normalized) return {};
  const resolved = activityAliases.get(normalized);
  if (resolved) return { activity: resolved };

  const stripped = normalized.split('_').filter((word) => !ACTIVITY_MARKERS.has(word) && !GENERIC_WORDS.has(word));
  const strippedTerm = stripped.join('_');
  const strippedResolved = activityAliases.get(strippedTerm);
  if (strippedResolved) return { activity: strippedResolved };

  return { rawActivityHint: strippedTerm.replaceAll('_', ' ') || normalized.replaceAll('_', ' ') };
}

function activityHintFromText(text: string): string | undefined {
  const words = normalizeActivityTerm(text).split('_');
  for (let index = 1; index < words.length; index += 1) {
    if (!ACTIVITY_MARKERS.has(words[index])) continue;
    const candidateWords: string[] = [];
    for (let candidateIndex = index - 1; candidateIndex >= 0; candidateIndex -= 1) {
      const candidate = words[candidateIndex];
      if (GENERIC_WORDS.has(candidate) || STOPWORDS.has(candidate)) break;
      candidateWords.unshift(candidate);
    }
    if (candidateWords.length > 0) return candidateWords.join('_');
  }
  return undefined;
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

  const directCandidates = [
    isDuck && 'duck',
    isPoultry && 'poultry_farming',
    isFish && 'fish_farming',
    isGoat && 'goat_farming',
    isSheep && 'sheep_farming',
    isIrrigation && 'irrigation',
    isSell && isCrop && 'farm_produce_marketing',
    (isInsurance || isCropProtection) && isCrop && 'notified_crop_farming',
    isMachine && 'farm_mechanization',
    isTailoring && 'tailoring',
    isArtisan && 'artisan_trade',
    concepts.has('dairy') && 'dairy',
    concepts.has('education') && 'education',
    isCrop && !isBusiness && (!activityHintFromText(text) || !isStart) && 'crop_farming',
  ].filter((candidate): candidate is string => Boolean(candidate));

  let activity: string | undefined;
  for (const candidate of directCandidates) {
    const resolved = resolveActivity(candidate).activity;
    if (resolved) {
      activity = resolved;
      break;
    }
  }

  let rawActivityHint: string | undefined;
  if (!activity) {
    const candidate = input.existingActivity?.trim() || activityHintFromText(text);
    if (candidate) rawActivityHint = resolveActivity(candidate).rawActivityHint;
  }

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

  return { goal, need, activity, beneficiary, rawActivityHint };
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

function eligibilityValuesEqual(left: SchemeEligibilityAnswer, right: SchemeEligibilityAnswer): boolean {
  if (typeof left === 'string' && typeof right === 'string') {
    return normalizeText(left) === normalizeText(right);
  }
  return left === right;
}

function resolveCriterionValue(
  criterion: EligibilityCriterion,
  input: MatcherInput,
  scheme: Scheme,
  answers: SchemeEligibilityAnswers
): SchemeEligibilityAnswer | undefined {
  if (criterion.derived_from === 'location.state') return input.state;
  if (criterion.derived_from === 'scheme_details.sourceStatus') return schemeDetailStatusById.get(scheme.id);
  if (!criterion.field) return undefined;
  if (Object.prototype.hasOwnProperty.call(answers, criterion.field)) return answers[criterion.field];

  const sharedValue = (input as unknown as Record<string, unknown>)[criterion.field];
  return typeof sharedValue === 'string' || typeof sharedValue === 'number' || typeof sharedValue === 'boolean'
    ? sharedValue
    : undefined;
}

function numericBoundPasses(
  value: number,
  bound: number | null | undefined,
  inclusive: boolean | undefined,
  side: 'min' | 'max'
): boolean {
  if (bound === undefined || bound === null) return true;
  if (side === 'min') return inclusive === false ? value > bound : value >= bound;
  return inclusive === false ? value < bound : value <= bound;
}

function criterionPasses(criterion: EligibilityCriterion, value: SchemeEligibilityAnswer): boolean | undefined {
  if (criterion.type === 'range' || criterion.type === 'threshold') {
    if (typeof value !== 'number') return undefined;
    return numericBoundPasses(value, criterion.min, criterion.min_inclusive, 'min')
      && numericBoundPasses(value, criterion.max, criterion.max_inclusive, 'max');
  }

  if (criterion.type === 'enum') {
    if (!criterion.allowed) return undefined;
    return criterion.allowed.some((allowed) => eligibilityValuesEqual(value, allowed));
  }

  if (criterion.type === 'boolean_required') {
    if (typeof value !== 'boolean' || criterion.required === undefined) return undefined;
    return value === criterion.required;
  }

  if (criterion.type === 'exclusion') {
    if (criterion.operator === 'equals' && criterion.value !== undefined) {
      return !eligibilityValuesEqual(value, criterion.value);
    }
    if (criterion.operator === 'in' && criterion.values) {
      return !criterion.values.some((excluded) => eligibilityValuesEqual(value, excluded));
    }
  }

  return undefined;
}

function criterionFailureReason(criterion: EligibilityCriterion): string {
  const label = criterion.source_text.replace(/^\[EXCLUSION\]\s*/i, '');
  return criterion.type === 'exclusion'
    ? `Catalog exclusion applies: ${label}.`
    : `Catalog eligibility requirement not met: ${label}.`;
}

export function evaluateEligibility(
  input: MatcherInput,
  intent: ExtractedIntent,
  scheme: Scheme,
  answers: SchemeEligibilityAnswers = {}
): EligibilityEvaluation {
  const location = locationScore(input, scheme);
  if (location.excluded) {
    return {
      status: 'EXCLUDED',
      contextScore: 0,
      reasons: [location.reason ?? 'Catalog marks this scheme as unavailable for matching.'],
    };
  }

  const eligibilityRecord = structuredEligibilityById[scheme.id];
  if (!eligibilityRecord) {
    return {
      status: 'UNKNOWN',
      contextScore: 0,
      reasons: ['Structured eligibility criteria are unavailable for this scheme.'],
    };
  }

  const reasons: string[] = [];
  let matchedChecks = 0;
  let unresolvedChecks = 0;

  const exclude = (reason: string): EligibilityEvaluation => ({
    status: 'EXCLUDED',
    contextScore: 0,
    reasons: [reason],
  });

  for (const criterion of eligibilityRecord.criteria) {
    if (criterion.type === 'info_only') continue;
    if (criterion.type === 'manual_verification_note') {
      unresolvedChecks += 1;
      continue;
    }

    const value = resolveCriterionValue(criterion, input, scheme, answers);
    if (value === undefined) {
      unresolvedChecks += 1;
      continue;
    }

    const passed = criterionPasses(criterion, value);
    if (passed === undefined) {
      unresolvedChecks += 1;
      continue;
    }

    if (!passed) return exclude(criterionFailureReason(criterion));
    matchedChecks += 1;
  }

  if (intent.beneficiary && termsFor(scheme).some((term) => term.includes(intent.beneficiary!.replaceAll('_', ' ')))) {
    matchedChecks += 1;
    reasons.push(`Beneficiary context matches ${intent.beneficiary}.`);
  }

  const contextScore = Math.min(weights.known_context_match, matchedChecks * 2);
  const hasUnresolvedEligibility = unresolvedChecks > 0;
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

function missingContextFor(intent: ExtractedIntent, input: MatcherInput): string[] {
  const missing: string[] = [];
  if (
    !intent.activity &&
    (!intent.rawActivityHint || !input.existingActivity?.trim()) &&
    ['access_credit', 'start_new_business', 'grow_existing_business'].includes(intent.goal ?? '')
  ) {
    missing.push('business_activity');
  } else if (!intent.activity && !intent.rawActivityHint) {
    missing.push('activity');
  }
  if (!intent.goal) missing.push('goal');
  return missing;
}

export function matchSchemes(input: MatcherInput): MatcherResult {
  const vocabulary = analyzeVocabulary(input.text);
  const text = vocabulary.normalizedText;
  const intent = extractIntent(text, input, vocabulary);
  const missingContext = missingContextFor(intent, input);

  if (!text) {
    return { intent, missingContext, rankedSchemes: [], matchTier: 'none' };
  }

  // If activity is missing for certain goals, we cannot match any scheme meaningfully.
  // Ask for the specific missing context (business activity) instead of showing irrelevant matches.
  if (missingContext.includes('business_activity')) {
    return { intent, missingContext, rankedSchemes: [], matchTier: 'none' };
  }

  const scored = schemes.flatMap((scheme) => {
    if (isComponentMismatch(intent.activity, scheme)) return [];
    const activity = activityScore(intent.activity, scheme);
    const intentPoints = intent.activity && activity.score === 0 ? 0 : goalScore(intent.goal, scheme);
    const needPoints = needScore(intent.need, scheme);
    const location = locationScore(input, scheme);
    const eligibility = evaluateEligibility(input, intent, scheme);

    if (eligibility.status === 'EXCLUDED') return [];

    const baseScore = intentPoints + activity.score + needPoints + location.score;
    const hasMeaningfulClosestSignal = needPoints > 0;
    if (!intent.activity && (!intent.rawActivityHint || !hasMeaningfulClosestSignal || baseScore === 0)) return [];

    const score = Math.min(
      100,
      intentPoints + activity.score + needPoints + location.score + eligibility.contextScore
    );
    const isClosestMatch = !intent.activity;
    const cappedScore = isClosestMatch ? Math.min(score, 39) : score;
    const relevance = isClosestMatch ? 'LOW' : relevanceFor(cappedScore);
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

    if (isClosestMatch && intent.rawActivityHint) {
      reasons.unshift(`No catalogue scheme is specific to ${intent.rawActivityHint} yet; this is the closest available support.`);
    }

    return [{ scheme, score: cappedScore, relevance, reasons, matchedCriteria, unknownCriteria, eligibility, specificity: activity.specificity }];
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
  const matchTier: MatchTier = intent.activity ? 'exact' : scored.length > 0 ? 'closest' : 'none';
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

  return { intent, missingContext, rankedSchemes, matchTier, rawActivityHint: intent.rawActivityHint };
}
