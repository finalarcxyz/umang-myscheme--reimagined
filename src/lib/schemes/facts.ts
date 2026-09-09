import type { LocalizedText } from './question-selector';

export interface FactOption {
  id: string;
  value: string;
  label: string;
  labels: LocalizedText;
  isOther?: boolean;
}

export interface FactDefinition {
  field: string;
  text: LocalizedText;
  options: FactOption[];
}

export const CANONICAL_FACTS: Record<string, FactDefinition> = {
  land_tenure: {
    field: 'land_tenure',
    text: {
      en: 'What is your farming arrangement?',
      od: 'ଆପଣଙ୍କ ଚାଷ ବ୍ୟବସ୍ଥା କିପରି ଅଟେ?',
    },
    options: [
      { id: 'own', value: 'own', label: 'I farm my own land', labels: { en: 'I farm my own land', od: 'ମୁଁ ନିଜ ଜମିରେ ଚାଷ କରେ' } },
      { id: 'bhaga_sharecropper', value: 'bhaga_sharecropper', label: 'Bhaga / Sharecropper / Tenant', labels: { en: 'Bhaga / Sharecropper / Tenant', od: 'ଭାଗଚାଷୀ / ଭଡ଼ାଟିଆ ଚାଷୀ' } },
      { id: 'shg_jlg', value: 'shg_jlg', label: 'Part of SHG / JLG', labels: { en: 'Part of SHG / JLG', od: 'SHG / JLG ର ସଦସ୍ୟ' } },
      { id: 'landless', value: 'landless', label: 'Landless', labels: { en: 'Landless', od: 'ଭୂମିହୀନ' } },
    ],
  },
  land_record_status: {
    field: 'land_record_status',
    text: {
      en: 'Do you have valid land records (Patta) or a written lease agreement?',
      od: 'ଆପଣଙ୍କ ପାଖରେ ବୈଧ ଜମି ପଟ୍ଟା କିମ୍ବା ଲିଖିତ ଲିଜ୍ ଚୁକ୍ତି ଅଛି କି?',
    },
    options: [
      { id: 'valid_records', value: 'valid_records', label: 'Yes, I have records', labels: { en: 'Yes, I have records', od: 'ହଁ, ମୋ ପାଖରେ ରେକର୍ଡ ଅଛି' } },
      { id: 'no_records', value: 'no_records', label: 'No records available', labels: { en: 'No records available', od: 'କୌଣସି ରେକର୍ଡ ନାହିଁ' } },
    ],
  },
  krushak_id_status: {
    field: 'krushak_id_status',
    text: {
      en: 'Do you have a valid Krushak Odisha ID?',
      od: 'ଆପଣଙ୍କ ପାଖରେ ବୈଧ କୃଷକ ଓଡ଼ିଶା ଆଇଡି ଅଛି କି?',
    },
    options: [
      { id: 'has_id', value: 'has_id', label: 'Yes, I have one', labels: { en: 'Yes, I have one', od: 'ହଁ, ମୋ ପାଖରେ ଅଛି' } },
      { id: 'no_id', value: 'no_id', label: 'No / Not sure', labels: { en: 'No / Not sure', od: 'ନାହିଁ / ମୁଁ ନିଶ୍ଚିତ ନୁହେଁ' } },
    ],
  },
  prior_machinery_subsidy_5yr: {
    field: 'prior_machinery_subsidy_5yr',
    text: {
      en: 'Have you received a government subsidy for farm machinery in the last 5 years?',
      od: 'ଗତ ୫ ବର୍ଷ ମଧ୍ୟରେ ଆପଣ କୃଷି ଯନ୍ତ୍ରପାତି ପାଇଁ ସରକାରୀ ସବସିଡି ପାଇଛନ୍ତି କି?',
    },
    options: [
      { id: 'yes_received', value: 'yes_received', label: 'Yes, received', labels: { en: 'Yes, received', od: 'ହଁ, ପାଇଛି' } },
      { id: 'no_not_received', value: 'no_not_received', label: 'No, have not received', labels: { en: 'No, have not received', od: 'ନା, ପାଇନାହିଁ' } },
    ],
  },
};
