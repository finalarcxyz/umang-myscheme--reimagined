import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node's type-stripping test runner requires the explicit TypeScript extension.
import { matchSchemes } from './matcher.ts';
// @ts-expect-error Node's type-stripping test runner requires the explicit TypeScript extension.
import { selectNextQuestion } from './question-selector.ts';

function select(text: string, context = {}) {
  return selectNextQuestion(matchSchemes({ text, ...context }), { text, ...context });
}

test('broad business loan asks for the business activity', () => {
  const result = select('mo business pain loan darkar');
  assert.equal(result.shouldAsk, true);
  if (result.shouldAsk) assert.equal(result.field, 'business/activity');
});

test('fish farming asks whether a pond exists or must be created', () => {
  const result = select('mu machha chasa karibaku chahunchhi');
  assert.equal(result.shouldAsk, true);
  if (result.shouldAsk) {
    assert.equal(result.field, 'pondStatus');
    assert.match(result.question, /pond/i);
  }
});

test('duck farming asks a material unit-size question, not activity', () => {
  const result = select('mu duck farm start karibaku chahunchhi');
  assert.equal(result.shouldAsk, true);
  if (result.shouldAsk) {
    assert.equal(result.field, 'projectSize');
    assert.match(result.question, /1,?000|unit/i);
    assert.doesNotMatch(result.question, /what.*activity/i);
  }
});

test('specific drip-irrigation request needs no ranking question', () => {
  assert.deepEqual(select('drip irrigation pain subsidy darkar'), { shouldAsk: false });
});

test('farmer pension asks age before landholding', () => {
  const first = select('I want a farmer pension');
  assert.equal(first.shouldAsk, true);
  if (first.shouldAsk) assert.equal(first.field, 'age');

  const second = select('I want a farmer pension', { age: 30 });
  assert.equal(second.shouldAsk, true);
  if (second.shouldAsk) assert.equal(second.field, 'landArea');
});

test('clear e-NAM request needs no ranking question', () => {
  assert.deepEqual(select('I want to sell my crops at a better price'), { shouldAsk: false });
});

test('goat farming asks the cataloged unit configuration', () => {
  const result = select('I want to start a goat farm');
  assert.equal(result.shouldAsk, true);
  if (result.shouldAsk) {
    assert.equal(result.field, 'projectSize');
    assert.match(result.question, /10.*1|unit/i);
  }
});

test('broad new business asks for activity', () => {
  const result = select('I want to start a business');
  assert.equal(result.shouldAsk, true);
  if (result.shouldAsk) assert.equal(result.field, 'business/activity');
});

test('broad farming improvement asks which support is needed', () => {
  const result = select('mu farming bhala karibaku chahunchhi');
  assert.equal(result.shouldAsk, true);
  if (result.shouldAsk) assert.equal(result.field, 'support_type');
});

test('specific crop insurance leader needs no ranking question', () => {
  assert.deepEqual(select('I need crop insurance'), { shouldAsk: false });
});

test('known poultry, goat, and duck activities never trigger a generic activity question', () => {
  const poultry = select('I want to start a poultry business');
  assert.deepEqual(poultry, { shouldAsk: false });

  const goat = select('I want to start goat farming');
  assert.equal(goat.shouldAsk, true);
  if (goat.shouldAsk) {
    assert.equal(goat.field, 'projectSize');
    assert.doesNotMatch(goat.question, /do you want to start/i);
  }

  const duck = select('I want to start duck farming');
  assert.equal(duck.shouldAsk, true);
  if (duck.shouldAsk) assert.notEqual(duck.field, 'activity');
});

test('generic business still asks for its activity', () => {
  const result = select('I want to start a business');
  assert.equal(result.shouldAsk, true);
  if (result.shouldAsk) assert.equal(result.field, 'business/activity');
});

test('Romanized tailoring answer advances to a materially different decision', () => {
  const result = select('selie business');
  assert.deepEqual(result, { shouldAsk: false });
});

test('business goal variants clarify business type without losing canonical meaning', () => {
  for (const text of [
    'Grow my business',
    'mo bybasaya badhaibaku chahuchi',
    'Start a new business',
    'nua buziness start kaibi',
  ]) {
    const result = select(text);
    assert.equal(result.shouldAsk, true, text);
    if (result.shouldAsk) assert.equal(result.field, 'business/activity', text);
  }
});

test('known local-language activities do not trigger generic activity questions', () => {
  for (const text of [
    'goat farm start karibi',
    'chheli chasa karibi',
    'I want to start a poultry business',
    'silai business start karibi',
    'selie business',
  ]) {
    const result = select(text);
    if (result.shouldAsk) {
      assert.notEqual(result.field, 'activity', text);
      assert.notEqual(result.field, 'business/activity', text);
    }
  }
});

test('farming-improvement variants ask for support type rather than activity', () => {
  for (const text of [
    'Improve my farming',
    'mo chasa ku bhala karibaku chahunchhi',
    'mo chasa ku badheiba ku chahunchhi',
  ]) {
    const result = select(text);
    assert.equal(result.shouldAsk, true, text);
    if (result.shouldAsk) assert.equal(result.field, 'support_type', text);
  }
});

test('farming support options are structured and deterministically ordered', () => {
  const result = select('Improve my farming', { language: 'en' });
  assert.equal(result.shouldAsk, true);
  if (!result.shouldAsk) return;
  assert.equal(result.id, 'farming_support_type');
  assert.deepEqual(
    result.options?.map((option) => option.id),
    ['crop_inputs', 'irrigation', 'farm_machinery', 'agricultural_marketing', 'crop_protection', 'other']
  );
  assert.deepEqual(
    result.options?.map((option) => option.label),
    ['Seeds / inputs', 'Irrigation', 'Equipment / machinery', 'Selling / marketing', 'Crop protection', "Other / I'm not sure"]
  );
});

test('finite questions use the selected English or Odia language', () => {
  const english = select('Improve my farming', { language: 'en' });
  const odia = select('Improve my farming', { language: 'od' });
  assert.equal(english.shouldAsk, true);
  assert.equal(odia.shouldAsk, true);
  if (english.shouldAsk && odia.shouldAsk) {
    assert.equal(english.question, english.questions.en);
    assert.equal(odia.question, odia.questions.od);
    assert.equal(english.options?.[0]?.label, 'Seeds / inputs');
    assert.equal(odia.options?.[0]?.label, 'ବିଆ / କୃଷି ସାମଗ୍ରୀ');
  }
});

test('duck size options appear only for the catalog-backed duck requirement', () => {
  const duck = select('I want to start duck farming', { language: 'en' });
  assert.equal(duck.shouldAsk, true);
  if (duck.shouldAsk) {
    assert.equal(duck.id, 'duck_unit_size');
    assert.deepEqual(duck.options?.map((option) => option.id), ['at_least_1000', 'below_1000', 'unsure']);
  }

  const poultry = select('I want to start a poultry business', { language: 'en' });
  assert.ok(!poultry.shouldAsk || poultry.id !== 'duck_unit_size');
});

test('normalized free-text crop-input answers materially resolve farming support', () => {
  for (const answer of ['fasala manji', 'bija', 'crop seeds']) {
    const text = `Improve my farming ${answer}`;
    const matched = matchSchemes({ text });
    assert.equal(matched.intent.need, 'crop_inputs', answer);
    assert.deepEqual(selectNextQuestion(matched, { text, language: 'en' }), { shouldAsk: false });
  }
});
