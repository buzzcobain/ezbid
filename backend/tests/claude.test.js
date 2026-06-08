import { describe, test, expect, vi } from 'vitest';

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    Anthropic: vi.fn().mockImplementation(() => {
      return {
        messages: {
          create: vi.fn().mockResolvedValue({
            content: [{ text: 'Mock Claude Response' }]
          })
        }
      };
    })
  };
});

describe('Claude Service Wrapper', () => {
  test('Demo Mode behavior when API key is missing', async () => {
    // Ensure ANTHROPIC_API_KEY is not set
    const originalKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    const claude = (await import('../services/claude.js?demo=true')).default;

    expect(claude.isDemoMode).toBe(true);

    const result1 = await claude.classifyApplication('Demo text');
    const result2 = await claude.draftBidDocument({ name: 'test' });
    expect(result1).toBeNull();
    expect(result2).toBeNull();

    // Restore key
    if (originalKey) process.env.ANTHROPIC_API_KEY = originalKey;
  });

  test('Real Mode behavior when API key is present', async () => {
    // Set mock key
    process.env.ANTHROPIC_API_KEY = 'mock-api-key-123';

    const claude = (await import('../services/claude.js?real=true')).default;

    expect(claude.isDemoMode).toBe(false);

    const classification = await claude.classifyApplication('Important planning data...');
    expect(classification).toBe('Mock Claude Response');

    const draft = await claude.draftBidDocument({ projectName: 'Test Project', reference: 'Flag-123' });
    expect(draft).toBe('Mock Claude Response');
  });
});
