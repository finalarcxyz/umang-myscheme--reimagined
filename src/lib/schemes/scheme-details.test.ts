import assert from 'node:assert/strict';
import test from 'node:test';
import { catalog } from './loader';
import details from './scheme_details.json' with { type: 'json' };

test('detail source covers every declared unique scheme with stable slugs', () => {
  assert.equal(details.schemes.length, details.schemeCount);
  assert.equal(new Set(details.schemes.map((scheme) => scheme.id)).size, details.schemeCount);
  assert.deepEqual(
    details.schemes.map((scheme) => scheme.id).sort(),
    catalog.schemes.map((scheme) => scheme.id).sort()
  );
});

test('the six primary demo scheme records have sourced detail and official URLs', () => {
  for (const id of ['pmv', 'ssgsf', 'scdf', 'smbdlp', 'nfsmcss', 'nssw']) {
    const scheme = details.schemes.find((candidate) => candidate.id === id);
    assert.ok(scheme, `Missing detail for ${id}`);
    assert.equal(scheme.sourceStatus, 'source_text_available');
    assert.ok(scheme.officialUmangUrl);
    assert.ok(scheme.sections.Details?.length);
    assert.ok(scheme.sections.Eligibility?.length);
  }
});

test('records without supplied detail remain explicitly marked unavailable', () => {
  const unresolved = details.schemes.find((scheme) => scheme.id === 'visvasi');
  assert.equal(unresolved?.sourceStatus, 'no_detail_text');
  assert.deepEqual(unresolved?.sections, {});
});
