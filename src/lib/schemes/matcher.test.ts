import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node's type-stripping test runner requires the explicit TypeScript extension.
import { matchSchemes } from './matcher.ts';

interface Scenario {
  text: string;
  goal: string;
  activity?: string;
  need?: string;
  expectedIds: string[];
}

const scenarios: Scenario[] = [
  {
    text: 'mu duck farm start karibaku chahunchhi',
    goal: 'start_new_activity',
    activity: 'duck_farming',
    expectedIds: ['scdf', 'smbdlp', 'kalia'],
  },
  {
    text: 'mu machha chasa karibaku chahunchhi',
    goal: 'start_new_activity',
    activity: 'fish_farming',
    expectedIds: ['piatibft', 'mpy-mcpnpky', 'pfmeiiao'],
  },
  {
    text: 'drip irrigation pain subsidy darkar',
    goal: 'reduce_cost_or_improve_productivity',
    activity: 'irrigation',
    need: 'subsidy',
    expectedIds: ['pmksypdmc'],
  },
  {
    text: 'I want to sell my crops at a better price',
    goal: 'sell_or_market',
    activity: 'farm_produce_marketing',
    need: 'market_access',
    expectedIds: ['e-nam', 'ami'],
  },
  {
    text: 'I want a farmer pension',
    goal: 'protect_income',
    activity: 'crop_farming',
    need: 'pension',
    expectedIds: ['pmkmdy'],
  },
  {
    text: 'I need crop insurance',
    goal: 'protect_income',
    activity: 'notified_crop_farming',
    need: 'insurance',
    expectedIds: ['pmfby'],
  },
  {
    text: 'I want to buy a farm machine',
    goal: 'improve_productivity',
    activity: 'farm_mechanization',
    need: 'equipment',
    expectedIds: ['smam', 'acandabc'],
  },
  {
    text: 'I am an artisan and need a toolkit and loan',
    goal: 'grow_existing_activity',
    activity: 'artisan_trade',
    need: 'toolkit_and_credit',
    expectedIds: ['pmv'],
  },
];

for (const scenario of scenarios) {
  test(scenario.text, () => {
    const result = matchSchemes({ text: scenario.text });
    assert.equal(result.intent.goal, scenario.goal);
    assert.equal(result.intent.activity, scenario.activity);
    assert.equal(result.intent.need, scenario.need);
    assert.deepEqual(
      result.rankedSchemes.slice(0, scenario.expectedIds.length).map((scheme) => scheme.id),
      scenario.expectedIds
    );
    assert.ok(result.rankedSchemes.length <= 5);
    assert.ok(result.rankedSchemes.every((scheme) => scheme.score >= 40));
    assert.ok(result.rankedSchemes.flatMap((scheme) => scheme.followUpQuestions).length <= 2);
  });
}

test('broad business credit request asks for activity instead of guessing', () => {
  const result = matchSchemes({ text: 'mo business pain loan darkar' });
  assert.equal(result.intent.goal, 'access_credit');
  assert.equal(result.intent.need, 'loan');
  assert.equal(result.intent.activity, undefined);
  assert.ok(result.missingContext.includes('business_activity'));
  assert.deepEqual(result.rankedSchemes, []);
});

test('known hard age exclusion is applied independently from relevance', () => {
  const result = matchSchemes({ text: 'I want a farmer pension', age: 50 });
  assert.ok(!result.rankedSchemes.some((scheme) => scheme.id === 'pmkmdy'));
});

test('explicit poultry, goat, and duck activities are recognized', () => {
  const poultry = matchSchemes({ text: 'I want to start a poultry business' });
  assert.equal(poultry.intent.activity, 'poultry_farming');
  assert.equal(poultry.rankedSchemes[0]?.id, 'smbdlp');

  const goat = matchSchemes({ text: 'I want to start goat farming' });
  assert.equal(goat.intent.activity, 'goat_farming');
  assert.equal(goat.rankedSchemes[0]?.id, 'ssgsf');

  const duck = matchSchemes({ text: 'I want to start duck farming' });
  assert.equal(duck.intent.activity, 'duck_farming');
  assert.equal(duck.rankedSchemes[0]?.id, 'scdf');
});

test('generic business remains unresolved', () => {
  const result = matchSchemes({ text: 'I want to start a business' });
  assert.equal(result.intent.activity, undefined);
  assert.ok(result.missingContext.includes('business_activity'));
});

test('bounded Romanized silai variants resolve to tailoring candidates', () => {
  for (const variant of ['selie business', 'silai business', 'silei business', 'selai business', 'selei business', 'silie business']) {
    const result = matchSchemes({ text: variant });
    assert.equal(result.intent.activity, 'tailoring');
    assert.equal(result.rankedSchemes[0]?.id, 'pmv');
    assert.ok(result.rankedSchemes.some((scheme) => scheme.id === 'aksmsy'));
  }
});

test('Romanized farming and livestock phrases remain recognized', () => {
  assert.equal(matchSchemes({ text: 'mu machha chasa karibaku chahunchhi' }).intent.activity, 'fish_farming');
  assert.equal(matchSchemes({ text: 'mu duck farm start karibaku chahunchhi' }).intent.activity, 'duck_farming');
});

test('recommendations expose catalog-backed evidence without fabricating district eligibility', () => {
  const result = matchSchemes({
    text: 'I want to start goat farming',
    state: 'Odisha',
    district: 'Khordha',
  });
  const top = result.rankedSchemes[0];
  assert.equal(top?.id, 'ssgsf');
  assert.ok(top?.matchedCriteria.some((criterion) => /activity.*goat farming/i.test(criterion)));
  assert.ok(top?.matchedCriteria.some((criterion) => /location.*odisha/i.test(criterion)));
  assert.ok(top?.unknownCriteria.some((criterion) => /land|prior subsidy|unit-size/i.test(criterion)));
  assert.ok(![...(top?.reasons ?? []), ...(top?.matchedCriteria ?? [])].some((value) => /khordha|district.*matched/i.test(value)));
  assert.notEqual(top?.eligibilityStatus, 'ELIGIBLE');
});

test('clean and mixed-language business growth variants share one canonical goal', () => {
  const variants = [
    'Grow my business',
    'mo byabasaya badhaibaku chahunchhi',
    'mo business badhaibaku chahunchi',
    'mo bybasaya badhaibaku chahuchi',
    'mo business badhaibi',
  ];
  for (const text of variants) {
    const result = matchSchemes({ text });
    assert.equal(result.intent.goal, 'grow_existing_business', text);
    assert.equal(result.intent.activity, undefined, text);
  }
});

test('clean, Romanized, mixed, and typo business-start variants share one canonical goal', () => {
  const variants = [
    'Start a new business',
    'nua byabasaya arambha karibaku chahunchhi',
    'nua business start karibi',
    'nua buziness start kaibi',
  ];
  for (const text of variants) {
    const result = matchSchemes({ text });
    assert.equal(result.intent.goal, 'start_new_business', text);
    assert.equal(result.intent.activity, undefined, text);
  }
});

test('farming-improvement variants share canonical activity and goal', () => {
  const variants = [
    'Improve my farming',
    'mo chasa ku unnata karibaku chahunchhi',
    'mo chasa ku bhala karibaku chahunchhi',
    'mo chasa ku badheiba ku chahunchhi',
    'mo chasa ku bhala karibaku bhabuchi',
  ];
  for (const text of variants) {
    const result = matchSchemes({ text });
    assert.equal(result.intent.activity, 'crop_farming', text);
    assert.equal(result.intent.goal, 'improve_farming', text);
  }
});

test('crop-protection variants share canonical activity, goal, and need', () => {
  const variants = [
    'Protect my crops',
    'mo fasala ku surakhya deba pain sahajya darkar',
    'mo fasala ku safe rakhiba pain help darkar',
  ];
  for (const text of variants) {
    const result = matchSchemes({ text });
    assert.equal(result.intent.activity, 'notified_crop_farming', text);
    assert.equal(result.intent.goal, 'protect_income', text);
    assert.equal(result.intent.need, 'crop_protection', text);
  }
});

test('goat-farming variants share canonical activity and goal', () => {
  const variants = [
    'I want to start goat farming',
    'goat farm start karibaku chahunchhi',
    'goat farm start karibi',
    'chheli chasa karibi',
  ];
  for (const text of variants) {
    const result = matchSchemes({ text });
    assert.equal(result.intent.activity, 'goat_farming', text);
    assert.equal(result.intent.goal, 'start_new_activity', text);
  }
});

test('all supported tailoring spellings share the canonical tailoring activity', () => {
  const variants = [
    'silai business',
    'silai business start karibi',
    'silei business',
    'selai business',
    'selei business',
    'selie business',
    'silie business',
  ];
  for (const text of variants) {
    assert.equal(matchSchemes({ text }).intent.activity, 'tailoring', text);
  }
});

test('crop-input follow-up variants share the canonical need', () => {
  const variants = [
    'fasala manji',
    'bija',
    'bija darkar',
    'mo chasa pain bija darkar',
    'crop seeds',
  ];
  for (const text of variants) {
    const result = matchSchemes({ text });
    assert.equal(result.intent.need, 'crop_inputs', text);
  }
});

test('repeated Romanized action patterns compose with activities and needs', () => {
  const farming = matchSchemes({ text: 'mo chasa ku bhala karibaku chahunchi' });
  assert.equal(farming.intent.goal, 'improve_farming');
  assert.equal(farming.intent.activity, 'crop_farming');

  const inputs = matchSchemes({ text: 'mo chasa pain fasala manji darkar' });
  assert.equal(inputs.intent.activity, 'crop_farming');
  assert.equal(inputs.intent.need, 'crop_inputs');
});
