export type LanguageCode = 'en' | 'or';

export const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: 'English',
  or: 'ଓଡ଼ିଆ',
};

const STATE_LANGUAGE_MAP: Record<string, LanguageCode> = {
  odisha: 'or',
};

export function getLanguageForState(state: string): LanguageCode {
  return STATE_LANGUAGE_MAP[state.trim().toLowerCase()] ?? 'en';
}

export const goalInputTranslations = {
  en: {
    question: 'What are you trying to achieve?',
    supporting: 'Tell us in your own words or choose from the options below.',
    placeholder: 'Type or speak in English, Hindi,\nOdia or your own way',
    examples: 'Examples:',
    commonGoal: 'or choose a common goal',
    business: 'Grow my business',
    farming: 'Improve my farming',
    livestock: 'Start livestock activity',
    education: "Support my child's education",
    financial: 'Get financial support',
    other: 'Other goals',
    reassurance: 'You can explore schemes without login.',
    reassuranceSecond: 'Login is needed only when you apply or track.',
    needHelp: 'Need help?',
    assistant: 'Talk to assistant',
    findSchemes: 'Find schemes',
    filters: 'using filters',
  },
  or: {
    question: 'ଆପଣ କଣ କରିବାକୁ ଚାହୁଁଛନ୍ତି?',
    supporting: 'ଆପଣଙ୍କ ନିଜ ଭାଷାରେ କହନ୍ତୁ କିମ୍ବା ନିମ୍ନରେ ଥିବା ବିକଳ୍ପ ବାଛନ୍ତୁ।',
    placeholder: 'ଇଂରାଜୀ, ହିନ୍ଦୀ, ଓଡ଼ିଆ କିମ୍ବା ନିଜ ଭାବରେ\nଲେଖନ୍ତୁ କିମ୍ବା କହନ୍ତୁ',
    examples: 'ଉଦାହରଣ:',
    commonGoal: 'କିମ୍ବା ଏକ ସାଧାରଣ ଲକ୍ଷ୍ୟ ବାଛନ୍ତୁ',
    business: 'ମୋ ବ୍ୟବସାୟ ବଢ଼ାଇବା',
    farming: 'ମୋ ଚାଷ ଉନ୍ନତ କରିବା',
    livestock: 'ପଶୁପାଳନ କାର୍ଯ୍ୟ ଆରମ୍ଭ କରିବା',
    education: 'ମୋ ପିଲାଙ୍କ ଶିକ୍ଷାରେ ସହାୟତା',
    financial: 'ଆର୍ଥିକ ସହାୟତା ପାଇବା',
    other: 'ଅନ୍ୟାନ୍ୟ ଲକ୍ଷ୍ୟ',
    reassurance: 'ଆପଣ ଲଗଇନ୍ ବିନା ଯୋଜନାଗୁଡ଼ିକ ଦେଖିପାରିବେ।',
    reassuranceSecond: 'ଆବେଦନ କିମ୍ବା ଟ୍ରାକ୍ କରିବା ପାଇଁ ମାତ୍ର ଲଗଇନ୍ ଆବଶ୍ୟକ।',
    needHelp: 'ସହାୟତା ଦରକାର?',
    assistant: 'ସହାୟକଙ୍କ ସହ କଥା ହୁଅନ୍ତୁ',
    findSchemes: 'ଯୋଜନା ଖୋଜନ୍ତୁ',
    filters: 'ଫିଲ୍ଟର ବ୍ୟବହାର କରି',
  },
} as const;
