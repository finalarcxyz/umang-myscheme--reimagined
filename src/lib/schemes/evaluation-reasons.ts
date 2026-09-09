export type EvaluationReason = { en: string; od: string };

export const REJECTION_REASONS: Record<string, EvaluationReason> = {
  land_tenure: {
    en: 'You must be an owner cultivator, tenant farmer, sharecropper, or part of a farmer SHG/JLG to be eligible.',
    od: 'ଆପଣ ଯୋଗ୍ୟ ହେବା ପାଇଁ ମାଲିକ ଚାଷୀ, ଭଡ଼ାଟିଆ ଚାଷୀ, ଭାଗଚାଷୀ କିମ୍ବା ଚାଷୀ SHG/JLGର ସଦସ୍ୟ ହେବା ଆବଶ୍ୟକ।',
  },
  land_record_status: {
    en: 'Valid land records (Patta) or a written lease agreement are required to be eligible.',
    od: 'ଆପଣ ଯୋଗ୍ୟ ହେବା ପାଇଁ ବୈଧ ଜମି ପଟ୍ଟା କିମ୍ବା ଲିଖିତ ଲିଜ୍ ଚୁକ୍ତି ଆବଶ୍ୟକ।',
  },
  krushak_id_status: {
    en: 'A valid Krushak Odisha ID is required for this scheme.',
    od: 'ଏହି ଯୋଜନା ପାଇଁ ଏକ ବୈଧ କୃଷକ ଓଡ଼ିଶା ଆଇଡି ଆବଶ୍ୟକ।',
  },
  prior_machinery_subsidy_5yr: {
    en: 'Having received a government subsidy for farm machinery in the last 5 years disqualifies you from this scheme.',
    od: 'ଗତ ୫ ବର୍ଷ ମଧ୍ୟରେ କୃଷି ଯନ୍ତ୍ରପାତି ପାଇଁ ସରକାରୀ ସବସିଡି ପାଇଥିଲେ ଆପଣ ଏହି ଯୋଜନା ପାଇଁ ଅଯୋଗ୍ୟ ହେବେ।',
  },
};
