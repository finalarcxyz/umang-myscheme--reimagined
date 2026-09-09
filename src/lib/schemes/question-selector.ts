import { catalog } from './loader';
import type { MatcherInput, MatcherResult } from './matcher';

export type QuestionLanguage = 'en' | 'od' | 'or';

export interface QuestionSelectorContext extends Partial<MatcherInput> {
  language?: QuestionLanguage;
  pondStatus?: 'existing' | 'new' | 'none';
  projectSize?: number;
  priorSubsidy?: boolean;
  priorLoan?: boolean;
}

export interface LocalizedText {
  en: string;
  od: string;
}

export interface QuestionOption {
  id: string;
  value: string;
  label: string;
  labels: LocalizedText;
  isOther?: boolean;
}

export type QuestionSelection =
  | {
      shouldAsk: true;
      id: string;
      question: string;
      questions: LocalizedText;
      field: string;
      reason: string;
      options?: QuestionOption[];
    }
  | { shouldAsk: false };

interface CatalogScheme {
  id: string;
  scope: string[];
  eligibility_facts: string[];
  hard_exclusions: string[];
  questions: string[];
}

interface QuestionDefinition {
  field: string;
  text: LocalizedText;
  options?: Array<{
    id: string;
    value: string;
    labels: LocalizedText;
    isOther?: boolean;
  }>;
}

const QUESTION_DEFINITIONS: Record<string, QuestionDefinition> = {
  business_activity: {
    field: 'business/activity',
    text: {
      en: 'What kind of business do you want to start or grow?',
      od: 'ଆପଣ କେଉଁ ପ୍ରକାର ବ୍ୟବସାୟ ଆରମ୍ଭ କିମ୍ବା ବଢ଼ାଇବାକୁ ଚାହୁଁଛନ୍ତି?',
    },
  },
  activity: {
    field: 'activity',
    text: {
      en: 'What specific activity do you need support for?',
      od: 'ଆପଣ କେଉଁ ନିର୍ଦ୍ଦିଷ୍ଟ କାର୍ଯ୍ୟ ପାଇଁ ସହାୟତା ଚାହୁଁଛନ୍ତି?',
    },
  },
  farming_support_type: {
    field: 'support_type',
    text: {
      en: 'What kind of support would help your farming most?',
      od: 'ଆପଣଙ୍କ ଚାଷ ପାଇଁ କେଉଁ ପ୍ରକାର ସହାୟତା ସବୁଠାରୁ ଉପଯୋଗୀ ହେବ?',
    },
    options: [
      { id: 'crop_inputs', value: 'crop_inputs', labels: { en: 'Seeds / inputs', od: 'ବିଆ / କୃଷି ସାମଗ୍ରୀ' } },
      { id: 'irrigation', value: 'irrigation', labels: { en: 'Irrigation', od: 'ଜଳସେଚନ' } },
      { id: 'farm_machinery', value: 'farm_machinery', labels: { en: 'Equipment / machinery', od: 'ଯନ୍ତ୍ରପାତି / କୃଷି ମେସିନ୍' } },
      { id: 'agricultural_marketing', value: 'agricultural_marketing', labels: { en: 'Selling / marketing', od: 'ବିକ୍ରୟ / ବଜାର ସହାୟତା' } },
      { id: 'crop_protection', value: 'crop_protection', labels: { en: 'Crop protection', od: 'ଫସଲ ସୁରକ୍ଷା' } },
      {
        id: 'other',
        value: 'other',
        labels: { en: "Other / I'm not sure", od: 'ଅନ୍ୟ / ମୁଁ ନିଶ୍ଚିତ ନୁହେଁ' },
        isOther: true,
      },
    ],
  },
  state: {
    field: 'state',
    text: { en: 'Which state do you live in?', od: 'ଆପଣ କେଉଁ ରାଜ୍ୟରେ ରହୁଛନ୍ତି?' },
  },
  pension_age: {
    field: 'age',
    text: { en: 'What is your age?', od: 'ଆପଣଙ୍କ ବୟସ କେତେ?' },
  },
  pension_land: {
    field: 'landArea',
    text: { en: 'How much cultivable land do you hold?', od: 'ଆପଣଙ୍କ ପାଖରେ କେତେ ଚାଷଯୋଗ୍ୟ ଜମି ଅଛି?' },
  },
  fish_pond_status: {
    field: 'pondStatus',
    text: {
      en: 'Do you already have a pond, or do you want help creating one?',
      od: 'ଆପଣଙ୍କ ପାଖରେ ପୋଖରୀ ଅଛି, ନା ନୂଆ ପୋଖରୀ ଖୋଳିବାକୁ ସହାୟତା ଚାହୁଁଛନ୍ତି?',
    },
    options: [
      { id: 'existing', value: 'existing pond', labels: { en: 'I already have a pond', od: 'ମୋର ପୋଖରୀ ଅଛି' } },
      { id: 'new', value: 'new pond', labels: { en: 'I need a new pond', od: 'ମୋତେ ନୂଆ ପୋଖରୀ ଦରକାର' } },
      { id: 'unsure', value: 'pond status unsure', labels: { en: "I'm not sure", od: 'ମୁଁ ନିଶ୍ଚିତ ନୁହେଁ' } },
    ],
  },
  duck_unit_size: {
    field: 'projectSize',
    text: {
      en: 'How large a duck farming unit are you planning?',
      od: 'ଆପଣ କେତେ ବଡ଼ ବତକ ପାଳନ ୟୁନିଟ୍ କରିବାକୁ ଯୋଜନା କରୁଛନ୍ତି?',
    },
    options: [
      { id: 'at_least_1000', value: '1000', labels: { en: 'Around 1,000 ducks or more', od: 'ପ୍ରାୟ ୧,୦୦୦ ବତକ କିମ୍ବା ଅଧିକ' } },
      { id: 'below_1000', value: '999', labels: { en: 'Smaller than 1,000 ducks', od: '୧,୦୦୦ ବତକରୁ କମ୍' } },
      { id: 'unsure', value: 'not sure', labels: { en: "I'm not sure", od: 'ମୁଁ ନିଶ୍ଚିତ ନୁହେଁ' } },
    ],
  },
  goat_unit_size: {
    field: 'projectSize',
    text: {
      en: 'Would you be able to establish a 10-female and 1-male goat unit?',
      od: 'ଆପଣ ୧୦ଟି ମାଈ ଓ ୧ଟି ଅଣ୍ଡିରା ଛେଳିର ୟୁନିଟ୍ କରିପାରିବେ କି?',
    },
    options: [
      { id: 'yes', value: '11', labels: { en: 'Yes', od: 'ହଁ' } },
      { id: 'no', value: '1', labels: { en: 'No', od: 'ନା' } },
      { id: 'unsure', value: 'not sure', labels: { en: "I'm not sure", od: 'ମୁଁ ନିଶ୍ଚିତ ନୁହେଁ' } },
    ],
  },
};

const schemesById = new Map(
  (catalog.schemes as CatalogScheme[]).map((scheme) => [scheme.id, scheme])
);

function selectedLanguage(language?: QuestionLanguage): 'en' | 'od' {
  return language === 'od' || language === 'or' ? 'od' : 'en';
}

function buildQuestion(id: string, reason: string, language?: QuestionLanguage): QuestionSelection {
  const definition = QUESTION_DEFINITIONS[id];
  const selected = selectedLanguage(language);
  return {
    shouldAsk: true,
    id,
    question: definition.text[selected],
    questions: definition.text,
    field: definition.field,
    reason,
    options: definition.options?.map((option) => ({ ...option, label: option.labels[selected] })),
  };
}

function candidateIds(result: MatcherResult): string[] {
  return result.rankedSchemes.map((scheme) => scheme.id);
}

function hasMaterialRule(schemeId: string, pattern: RegExp): boolean {
  const scheme = schemesById.get(schemeId);
  return Boolean(
    scheme && [...scheme.eligibility_facts, ...scheme.hard_exclusions].some((fact) => pattern.test(fact))
  );
}

function selectLocationQuestion(
  result: MatcherResult,
  context: QuestionSelectorContext
): QuestionSelection | undefined {
  if (context.state || result.rankedSchemes.length < 2) return undefined;
  const exclusiveStates = new Set<string>();
  for (const ranked of result.rankedSchemes) {
    const scope = schemesById.get(ranked.id)?.scope ?? [];
    scope
      .filter((value) => /^(Odisha|Chhattisgarh)$/i.test(value))
      .forEach((state) => exclusiveStates.add(state.toLowerCase()));
  }
  return exclusiveStates.size > 1
    ? buildQuestion('state', 'The candidate schemes have different state availability.', context.language)
    : undefined;
}

export function selectNextQuestion(
  intentResult: MatcherResult,
  userContext: QuestionSelectorContext = {}
): QuestionSelection {
  const { intent, missingContext, rankedSchemes } = intentResult;
  const ids = candidateIds(intentResult);

  if (missingContext.includes('business_activity')) {
    return buildQuestion(
      'business_activity',
      'The business activity is required to avoid generic recommendations.',
      userContext.language
    );
  }

  if (missingContext.includes('activity') || (!intent.activity && !intent.rawActivityHint)) {
    // An unsupported activity supplied by the citizen is already answered. Do not ask
    // the generic activity question again; the matcher will classify the result as closest/none.
    if (!intent.goal) return { shouldAsk: false };
    const originalText = userContext.text?.normalize('NFKC').toLowerCase() ?? '';
    const isBroadFarmingGoal =
      /\b(farming|chasa|chasha|kheti)\b/.test(originalText) &&
      /\b(improve|bhala|better|grow|badheiba)\b/.test(originalText);
    if (intent.goal === 'improve_farming' || intent.goal === 'improve_productivity' || isBroadFarmingGoal) {
      return buildQuestion(
        'farming_support_type',
        'The goal is too broad to distinguish the relevant farming schemes.',
        userContext.language
      );
    }
    if (
      intent.goal === 'start_new_activity' ||
      intent.goal === 'start_new_business' ||
      intent.goal === 'grow_existing_business' ||
      intent.goal === 'access_credit'
    ) {
      return buildQuestion('business_activity', 'The activity is required to select relevant schemes.', userContext.language);
    }
    return buildQuestion('activity', 'The activity is required to distinguish relevant schemes.', userContext.language);
  }

  const locationSelection = selectLocationQuestion(intentResult, userContext);
  if (locationSelection) return locationSelection;

  if (
    intent.activity === 'crop_farming' &&
    (intent.goal === 'improve_farming' || intent.goal === 'improve_productivity') &&
    !intent.need
  ) {
    return buildQuestion(
      'farming_support_type',
      'The farming goal is known, but the support type is needed to distinguish relevant schemes.',
      userContext.language
    );
  }

  if (intent.need === 'pension' && ids[0] === 'pmkmdy') {
    if (userContext.age === undefined && hasMaterialRule('pmkmdy', /age\s*(?:>=|outside|\d)/i)) {
      return buildQuestion('pension_age', 'PM-KMY has a material entry-age requirement.', userContext.language);
    }
    if (userContext.landArea === undefined && hasMaterialRule('pmkmdy', /landholding|land area|hectare|land records/i)) {
      return buildQuestion('pension_land', 'PM-KMY has a material landholding requirement.', userContext.language);
    }
  }

  if (
    intent.activity === 'fish_farming' &&
    userContext.pondStatus === undefined &&
    ids.includes('mpy-mcpnpky') &&
    ids.some((id) => id === 'piatibft' || id === 'pfmeiiao')
  ) {
    return buildQuestion(
      'fish_pond_status',
      'Pond status separates pond-creation support from other fishery schemes.',
      userContext.language
    );
  }

  const duckScheme = schemesById.get('scdf');
  const hasDuckThreshold = duckScheme?.eligibility_facts.some((fact) => /1,000-duck/i.test(fact));
  if (
    intent.activity === 'duck_farming' &&
    ids[0] === 'scdf' &&
    userContext.projectSize === undefined &&
    hasDuckThreshold
  ) {
    return buildQuestion(
      'duck_unit_size',
      'The leading duck scheme has a cataloged 1,000-duck unit requirement.',
      userContext.language
    );
  }

  if (intent.activity === 'goat_farming' && ids.includes('ssgsf') && userContext.projectSize === undefined) {
    return buildQuestion(
      'goat_unit_size',
      'The Odisha goat scheme has a cataloged 10+1 unit configuration.',
      userContext.language
    );
  }

  if (rankedSchemes.length > 0) return { shouldAsk: false };
  return { shouldAsk: false };
}
