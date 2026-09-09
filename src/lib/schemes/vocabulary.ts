import { catalog } from './loader.ts';

export type VocabularyConcept =
  | 'business'
  | 'start'
  | 'do_activity'
  | 'grow'
  | 'improve'
  | 'help'
  | 'protect'
  | 'crop_farming'
  | 'crop'
  | 'loan'
  | 'subsidy'
  | 'crop_inputs'
  | 'insurance'
  | 'training'
  | 'sell'
  | 'market'
  | 'tailoring'
  | 'goat'
  | 'poultry'
  | 'duck'
  | 'dairy'
  | 'fish'
  | 'fish_pond'
  | 'irrigation'
  | 'farm_machinery'
  | 'education'
  | 'artisan'
  | 'pension';

export interface VocabularyAnalysis {
  concepts: ReadonlySet<VocabularyConcept>;
  normalizedText: string;
}

const SPELLING_VARIANTS: Record<string, string> = {
  buisness: 'business',
  buziness: 'business',
  busines: 'business',
  byabasaya: 'business',
  bybasaya: 'business',
  byabasya: 'business',
  chasha: 'chasa',
  kheti: 'chasa',
  lon: 'loan',
  rin: 'loan',
  rina: 'loan',
  chahunchi: 'chahunchhi',
  chahuchi: 'chahunchhi',
  silai: 'silai',
  silei: 'silai',
  selai: 'silai',
  selei: 'silai',
  selie: 'silai',
  silie: 'silai',
  chheli: 'goat',
  chaga: 'goat',
  chhag: 'goat',
  bataka: 'duck',
  machha: 'fish',
  matsya: 'fish',
  fasala: 'crop',
  fasal: 'crop',
  karigar: 'artisan',
  silpi: 'artisan',
};

const CURATED_ALIASES: Record<VocabularyConcept, string[]> = {
  business: ['business', 'byabasa', 'dokan', 'dukana', 'fmcg'],
  start: ['start', 'new', 'nua', 'arambha', 'aarambha', 'begin'],
  do_activity: ['karibi', 'kaibi', 'karibaku', 'kariba', 'karibaku chahunchhi'],
  grow: ['grow', 'expand', 'badhaibaku', 'badhaibi', 'badheiba', 'badheibaku', 'badhei'],
  improve: ['improve', 'better', 'bhala', 'unnata', 'unnati'],
  help: ['help', 'support', 'sahajya', 'darkar'],
  protect: ['protect', 'protection', 'safe', 'surakhya', 'rakhiba', 'banchiba'],
  crop_farming: ['farming', 'farm', 'chasa', 'chasa kariba'],
  crop: ['crop', 'crops'],
  loan: ['loan', 'credit', 'paisa darkar', 'taka darkar'],
  subsidy: ['subsidy', 'sarkari sahajya'],
  crop_inputs: ['seed', 'seeds', 'crop seed', 'crop seeds', 'bija', 'bijaa', 'manji', 'fasala manji', 'fasal manji'],
  insurance: ['insurance', 'bima'],
  training: ['training', 'skill training', 'talim', 'sikhya'],
  sell: ['sell', 'selling', 'bikri'],
  market: ['market', 'marketing', 'mandi', 'better price', 'bhala dam'],
  tailoring: ['silai', 'tailoring', 'sewing', 'stitching'],
  goat: ['goat', 'goat farm', 'goat farming', 'goat rearing', 'bakri palan'],
  poultry: ['poultry', 'poultry farm', 'chicken', 'hen', 'kukuda', 'broiler', 'layer'],
  duck: ['duck', 'duck farm', 'duck farming', 'duckery', 'bataka palana'],
  dairy: ['dairy', 'buffalo', 'buffalo farming', 'milk business', 'gai palana'],
  fish: ['fish', 'fish farm', 'fish farming', 'aquaculture'],
  fish_pond: ['fish pond', 'new pond', 'pond digging', 'pokhari'],
  irrigation: ['irrigation', 'drip', 'sprinkler', 'jala', 'jalasechana', 'pani'],
  farm_machinery: ['farm machine', 'farm machinery', 'farm equipment', 'tractor', 'mechanization'],
  education: ['education', 'study', 'school', 'college', 'scholarship', 'padhai'],
  artisan: ['artisan', 'craft', 'traditional trade'],
  pension: ['pension', 'maandhan', 'old age'],
};

const CATALOG_LEXICON_MAP: Partial<Record<string, VocabularyConcept>> = {
  farming: 'crop_farming',
  business: 'business',
  loan: 'loan',
  subsidy: 'subsidy',
  duck: 'duck',
  fish: 'fish',
  goat: 'goat',
  irrigation: 'irrigation',
  artisan: 'artisan',
};

const catalogLexicon = catalog.taxonomy.language_layer.starter_lexicon as Record<string, string[]>;

function baseNormalize(rawText: string): string {
  return rawText
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasPhrase(text: string, phrase: string): boolean {
  const normalizedPhrase = baseNormalize(phrase)
    .split(' ')
    .map((token) => SPELLING_VARIANTS[token] ?? token)
    .join(' ');
  return normalizedPhrase.length > 1 && ` ${text} `.includes(` ${normalizedPhrase} `);
}

export function normalizeUserText(rawText: string): string {
  return baseNormalize(rawText)
    .split(' ')
    .map((token) => SPELLING_VARIANTS[token] ?? token)
    .join(' ');
}

export function analyzeVocabulary(rawText: string): VocabularyAnalysis {
  const normalizedText = normalizeUserText(rawText);
  const concepts = new Set<VocabularyConcept>();

  for (const [concept, aliases] of Object.entries(CURATED_ALIASES) as Array<
    [VocabularyConcept, string[]]
  >) {
    if (aliases.some((alias) => hasPhrase(normalizedText, alias))) concepts.add(concept);
  }

  for (const [catalogKey, concept] of Object.entries(CATALOG_LEXICON_MAP)) {
    if (concept && catalogLexicon[catalogKey]?.some((alias) => hasPhrase(normalizedText, alias))) {
      concepts.add(concept);
    }
  }

  return { concepts, normalizedText };
}
