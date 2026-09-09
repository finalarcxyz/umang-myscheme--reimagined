import assert from 'node:assert/strict';
import test from 'node:test';
import { getAllSchemes, getEligibilityMap } from './loader.ts';

test('Validator: check all loaded schemes have required metadata and valid JSON', () => {
  const schemes = getAllSchemes();

  // Basic validation that we loaded schemes
  assert.ok(schemes.length > 0, 'No schemes loaded');

  const ids = new Set();
  for (const scheme of schemes) {
    // Validate required fields
    assert.ok(scheme.id, 'Scheme is missing id');
    assert.ok(scheme.name, `Scheme ${scheme.id} is missing name`);

    // Ensure ids are unique
    assert.ok(!ids.has(scheme.id), `Duplicate scheme id: ${scheme.id}`);
    ids.add(scheme.id);
  }
});

test('Validator: check eligibility map syncs with schemes', () => {
  const schemes = getAllSchemes();
  const eligibilityMap = getEligibilityMap();

  for (const scheme of schemes) {
    const eligibility = eligibilityMap[scheme.id];

    // Validate mapping presence
    assert.ok(eligibility, `Missing eligibility entry for ${scheme.id}`);
    assert.equal(eligibility.id, scheme.id, `ID mismatch in eligibility for ${scheme.id}`);
    assert.ok(Array.isArray(eligibility.criteria), `Eligibility criteria should be an array for ${scheme.id}`);
  }
});
