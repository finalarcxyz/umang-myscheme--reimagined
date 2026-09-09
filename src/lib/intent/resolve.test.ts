import { describe, it } from 'node:test';
import assert from 'node:assert';
import { resolveIntent } from './resolve';

describe('Intent Resolver Utility', () => {
  it('should resolve locally with high confidence for known vocabulary terms', async () => {
    const text = 'I want to start a farming business';
    const result = await resolveIntent(text, 'en');

    assert.strictEqual(result.query, text);
    assert.strictEqual(result.detectedLanguage, 'en');
    assert.strictEqual(result.confidence, 0.9);
    assert.ok(result.tags.includes('crop_farming') || result.tags.includes('business'));
    assert.ok(result.primaryNeed === 'crop_farming' || result.primaryNeed === 'business');
  });

  it('should use deterministic local cache for explicit concepts', async () => {
    const text = 'loan for fish farming';
    const result = await resolveIntent(text);

    assert.strictEqual(result.detectedLanguage, 'en');
    assert.strictEqual(result.confidence, 0.9);
    assert.ok(result.tags.includes('loan') || result.tags.includes('fish'));
  });

  it('should fallback securely when vocabulary is missing (mock fallback)', async () => {
    // Delete any environmental variables that might exist to trigger mock fallback
    const originalEndpoint = process.env.LLM_ENDPOINT;
    const originalKey = process.env.LLM_API_KEY;
    delete process.env.LLM_ENDPOINT;
    delete process.env.LLM_API_KEY;

    const text = 'A very random confusing query about quantum physics';
    const result = await resolveIntent(text, 'hi');

    assert.strictEqual(result.query, text);
    assert.strictEqual(result.detectedLanguage, 'en'); // Mock fallback is set to 'en'
    assert.strictEqual(result.primaryNeed, 'unresolved');
    assert.strictEqual(result.confidence, 0.1);
    assert.deepStrictEqual(result.tags, []);

    // Restore env just in case
    if (originalEndpoint) process.env.LLM_ENDPOINT = originalEndpoint;
    if (originalKey) process.env.LLM_API_KEY = originalKey;
  });

  it('should handle LLM API failures gracefully and return valid schema', async () => {
    // Set invalid endpoint to trigger fetch catch block
    const originalEndpoint = process.env.LLM_ENDPOINT;
    const originalKey = process.env.LLM_API_KEY;

    process.env.LLM_ENDPOINT = 'http://localhost:9999/invalid-endpoint';
    process.env.LLM_API_KEY = 'test-key';

    const text = 'This should fail in fetch';
    const result = await resolveIntent(text);

    assert.strictEqual(result.primaryNeed, 'unknown');
    assert.strictEqual(result.confidence, 0);

    // Restore env just in case
    if (originalEndpoint) process.env.LLM_ENDPOINT = originalEndpoint;
    else delete process.env.LLM_ENDPOINT;
    if (originalKey) process.env.LLM_API_KEY = originalKey;
    else delete process.env.LLM_API_KEY;
  });
});
