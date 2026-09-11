import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';
import { AiBundleAnalysisResult } from '../../types';

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic | null {
  if (anthropicClient) return anthropicClient;
  if (env.ANTHROPIC_API_KEY && env.ANTHROPIC_API_KEY.trim() !== '') {
    anthropicClient = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    return anthropicClient;
  }
  return null;
}

export const anthropicService = {
  /**
   * Calls Anthropic Claude with strict structured JSON enforcement
   */
  async generateAnalysis(systemPrompt: string, userPrompt: string): Promise<{ result: AiBundleAnalysisResult; rawResponse?: any }> {
    const client = getAnthropicClient();

    // If real API key is configured, invoke Anthropic Claude SDK
    if (client) {
      try {
        const response = await client.messages.create({
          model: env.ANTHROPIC_MODEL,
          max_tokens: 1024,
          temperature: 0.2,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        });

        const textBlock = response.content.find(c => c.type === 'text');
        if (!textBlock || !('text' in textBlock)) {
          throw new Error('No text response received from Anthropic API');
        }

        // Clean any accidental markdown code fences
        let cleanedText = textBlock.text.trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(cleanedText);
        this.validateAnalysisStructure(parsed);

        return {
          result: {
            summary: parsed.summary,
            strengths: parsed.strengths,
            risks: parsed.risks,
            recommendations: parsed.recommendations,
            model: env.ANTHROPIC_MODEL,
            generatedAt: new Date().toISOString()
          },
          rawResponse: response
        };
      } catch (err: any) {
        console.error('Anthropic API execution error:', err.message);
        // Fall back gracefully if error occurs so the merchant experience doesn't break
        if (!env.USE_DEMO_DATA) {
          throw new Error(`AI analysis service unavailable: ${err.message}`);
        }
      }
    }

    // Safe fallback analysis for development/demo mode when API key is not configured
    return {
      result: {
        summary: 'KitFlow AI Analysis (Demo Mode): This setup demonstrates strong product compatibility with balanced customer appeal. Hardware components share complementary use cases with positive co-purchase history.',
        strengths: [
          'Strong category synergy: High affinity across gaming and workstation setups.',
          'Configured discount efficiency aligns with target conversion rates without eroding gross margin.',
          'Component pricing structure creates a clear perceived discount over individual purchases.'
        ],
        risks: [
          'Inventory risk: Monitor lower-stock components closely to prevent fulfillment delays.',
          'Consider reviewing discount elasticity during seasonal promotions.'
        ],
        recommendations: [
          'Maintain minimum warehouse reorder buffer of at least 15 units per component.',
          'Feature this bundle on the storefront home page setup finder to maximize conversion.',
          'Periodically recalculate scores after major catalog price adjustments.'
        ],
        model: 'claude-3-5-sonnet-20241022 (simulated)',
        generatedAt: new Date().toISOString()
      },
      rawResponse: { mode: 'demo_fallback' }
    };
  },

  /**
   * Validates structured output schema
   */
  validateAnalysisStructure(obj: any): void {
    if (!obj || typeof obj !== 'object') {
      throw new Error('Analysis result must be a JSON object');
    }
    if (typeof obj.summary !== 'string' || obj.summary.trim() === '') {
      throw new Error('Analysis result is missing valid summary string');
    }
    if (!Array.isArray(obj.strengths) || obj.strengths.length === 0) {
      throw new Error('Analysis result must contain a non-empty strengths array');
    }
    if (!Array.isArray(obj.risks)) {
      throw new Error('Analysis result must contain a risks array');
    }
    if (!Array.isArray(obj.recommendations) || obj.recommendations.length === 0) {
      throw new Error('Analysis result must contain a non-empty recommendations array');
    }
  }
};
