import { describe, it, expect } from 'vitest';
import { anthropicService } from '../../backend/src/services/ai/anthropic.service';

describe('AI Analysis Schema Validation & Resilience', () => {
  it('accepts a properly structured analysis result', () => {
    const valid = {
      summary: 'The bundle exhibits exceptional synergy and strong historical demand.',
      strengths: ['High co-purchase rate', 'Complementary form factors'],
      risks: ['Tight inventory on mousepad'],
      recommendations: ['Restock mousepad', 'Promote on collection page']
    };

    expect(() => anthropicService.validateAnalysisStructure(valid)).not.toThrow();
  });

  it('rejects analysis missing a summary', () => {
    const invalid = {
      summary: '',
      strengths: ['Strength 1'],
      risks: [],
      recommendations: ['Rec 1']
    };

    expect(() => anthropicService.validateAnalysisStructure(invalid)).toThrow('missing valid summary string');
  });

  it('rejects analysis with empty strengths array', () => {
    const invalid = {
      summary: 'Summary text',
      strengths: [],
      risks: [],
      recommendations: ['Rec 1']
    };

    expect(() => anthropicService.validateAnalysisStructure(invalid)).toThrow('non-empty strengths array');
  });

  it('rejects analysis with empty recommendations array', () => {
    const invalid = {
      summary: 'Summary text',
      strengths: ['Strength 1'],
      risks: [],
      recommendations: []
    };

    expect(() => anthropicService.validateAnalysisStructure(invalid)).toThrow('non-empty recommendations array');
  });

  it('returns valid demo fallback response when Anthropic API key is unset', async () => {
    const { result } = await anthropicService.generateAnalysis('system prompt', 'user prompt');
    expect(result).toBeDefined();
    expect(result.summary).toContain('KitFlow AI Analysis');
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});
