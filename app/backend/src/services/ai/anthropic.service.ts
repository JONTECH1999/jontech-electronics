import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';
import { AiBundleAnalysisResult } from '../../types';

function getAnthropicApiKey(): string {
  const key = (process.env.ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY || '').trim();
  return key;
}

function getAnthropicClient(): Anthropic | null {
  const apiKey = getAnthropicApiKey();
  // Valid Anthropic keys start with sk-ant- and are at least 25 characters long
  if (apiKey && apiKey.startsWith('sk-ant-') && apiKey.length > 25 && !apiKey.includes('your-key')) {
    return new Anthropic({ apiKey });
  }
  return null;
}

export const anthropicService = {
  /**
   * Calls Anthropic Claude with strict structured JSON enforcement,
   * or falls back to dynamic electronics domain evaluation when no API key is provided.
   */
  async generateAnalysis(
    systemPrompt: string,
    userPrompt: string,
    bundleData?: any
  ): Promise<{ result: AiBundleAnalysisResult; rawResponse?: any }> {
    const client = getAnthropicClient();

    // 1. If real API key is configured, invoke Anthropic Claude SDK
    if (client) {
      try {
        console.log(`[KitFlow AI] Invoking live Anthropic Claude API (model: ${env.ANTHROPIC_MODEL})...`);
        const response = await client.messages.create({
          model: env.ANTHROPIC_MODEL,
          max_tokens: 1024,
          temperature: 0.2,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        });

        const textBlock = response.content.find(c => c.type === 'text');
        if (!textBlock || !('text' in textBlock)) {
          throw new Error('No text response received from Anthropic Claude API');
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

        console.log(`[KitFlow AI] Live Anthropic response received and verified successfully!`);

        return {
          result: {
            summary: parsed.summary,
            strengths: parsed.strengths,
            risks: parsed.risks,
            recommendations: parsed.recommendations,
            model: `${env.ANTHROPIC_MODEL} (Live API)`,
            generatedAt: new Date().toISOString()
          },
          rawResponse: response
        };
      } catch (err: any) {
        console.error('[KitFlow AI] Anthropic Claude API error:', err.message);
        throw new Error(`Anthropic Claude API error: ${err.message}. Please verify your ANTHROPIC_API_KEY in app/backend/.env.`);
      }
    }

    // 2. Safe, dynamic electronics domain fallback when API key is not yet configured
    console.log('[KitFlow AI] No valid ANTHROPIC_API_KEY detected in app/backend/.env. Generating dynamic electronics evaluation.');
    return {
      result: this.generateElectronicsEvaluation(bundleData),
      rawResponse: { mode: 'dynamic_electronics_fallback', reason: 'No ANTHROPIC_API_KEY detected' }
    };
  },

  /**
   * Generates dynamic, domain-aware electronics analysis based on actual bundle hardware components
   */
  generateElectronicsEvaluation(bundleData?: any): AiBundleAnalysisResult {
    const bundleName = bundleData?.bundleName || 'Electronics Prototyping Kit';
    const items: Array<{ title: string; price: number; quantity: number }> = bundleData?.items || [];
    const itemNames = items.map(i => i.title).join(', ');
    const lowestStock = bundleData?.inventoryStatus?.lowestStock ?? 10;
    const criticalCount = bundleData?.inventoryStatus?.criticalCount ?? 0;
    const discount = bundleData?.discountPercent ?? 12;
    const score = bundleData?.totalScore ?? 85;

    const strengths: string[] = [];
    const risks: string[] = [];
    const recommendations: string[] = [];

    // Microcontroller & Core Processor Synergies
    if (items.some(i => i.title.includes('ESP32'))) {
      strengths.push('ESP32 Dual-Core architecture with native 2.4GHz WiFi & BLE 4.2 provides high-speed telemetry for cloud IoT dashboards.');
      strengths.push('3.3V logic level interfaces directly with I2C OLED displays and environmental sensors without level-shifting circuitry.');
    } else if (items.some(i => i.title.includes('Arduino'))) {
      strengths.push('Arduino ATmega328P 5V TTL architecture provides robust GPIO current driving capability for inductive relay and motor driver coils.');
      strengths.push('Standard R3 shield header layout simplifies jumper wiring and hands-on student breadboard prototyping.');
    } else if (items.some(i => i.title.includes('Raspberry Pi'))) {
      strengths.push('Raspberry Pi 4 quad-core ARM Cortex-A72 delivers sufficient compute capacity for edge computer vision and high-rate LiDAR telemetry.');
      strengths.push('Dedicated UART and I2C hardware bus pinouts support low-latency direct serial sensor streaming at 115200 baud.');
    } else if (items.some(i => i.title.includes('STM32'))) {
      strengths.push('STM32 ARM Cortex-M4 operating at 84MHz provides high-frequency hardware PWM timers for multi-channel industrial automation sequencing.');
      strengths.push('Optocoupler isolation on 5V relay module protects 3.3V STM32 microcontroller logic against back-EMF voltage spikes.');
    } else {
      strengths.push(`Components (${itemNames}) provide complementary hardware prototyping functionality for student and maker lab builds.`);
      strengths.push(`${discount}% bundle discount provides strong student appeal while protecting gross merchant margin.`);
    }

    // Sensor & Peripheral Synergies
    if (items.some(i => i.title.includes('DHT22'))) {
      strengths.push('DHT22 single-bus digital protocol provides calibrated temperature and humidity readings without consuming multiple analog ADC channels.');
    }
    if (items.some(i => i.title.includes('HC-SR04') || i.title.includes('Ultrasonic'))) {
      strengths.push('HC-SR04 ultrasonic echo timing pairs seamlessly with microcontroller microsecond timer interrupts for obstacle detection algorithms.');
    }
    if (items.some(i => i.title.includes('LiDAR'))) {
      strengths.push('TFmini-S 12-meter optical time-of-flight LiDAR sensor adds professional autonomous distance measuring capabilities.');
    }
    if (items.some(i => i.title.includes('L298N') || i.title.includes('Motor Driver'))) {
      strengths.push('Dual H-Bridge motor driver enables independent dual DC motor speed regulation with PWM duty cycle control.');
    }
    if (items.some(i => i.title.includes('OLED'))) {
      strengths.push('0.96" I2C OLED module provides instant on-device debugging readout at fixed bus address 0x3C.');
    }

    // Inventory & Supply Chain Risks
    if (criticalCount > 0 || lowestStock <= 2) {
      risks.push(`Critical inventory bottleneck: At least one core component has only ${lowestStock} unit(s) remaining in warehouse stock.`);
    } else if (lowestStock <= 5) {
      risks.push(`Low stock advisory: Reorder buffer is tight (${lowestStock} units remaining); bulk student lab orders may trigger backorders.`);
    } else {
      risks.push('Component lead times: Maintain regular supplier reorder cycles ahead of academic semester opening periods.');
    }

    if (items.some(i => i.title.includes('Raspberry Pi') || i.title.includes('Motor Driver'))) {
      risks.push('Power budget: High-load components (Raspberry Pi 4 / DC motors) require a dedicated external 5V 3A power source to avoid MCU brownouts.');
    }

    // Actionable Merchandising Recommendations
    recommendations.push(`Feature "${bundleName}" on the JonTech Electronics homepage kit finder to capture student and hobbyist project demand.`);
    if (lowestStock <= 5) {
      recommendations.push(`Issue a supplier purchase order to restock warehouse inventory to a safe minimum buffer of 20 units.`);
    }
    recommendations.push('Include a printed breadboard pinout reference and starter MicroPython/C++ code samples in the order fulfillment box.');

    return {
      summary: `KitFlow AI Analysis: "${bundleName}" is a well-calibrated electronics setup combining ${items.length} hardware components (${itemNames}) with a composite feasibility score of ${score}/100 and ${discount}% bundled savings.`,
      strengths: strengths.slice(0, 4),
      risks: risks.slice(0, 3),
      recommendations: recommendations.slice(0, 3),
      model: `${env.ANTHROPIC_MODEL} (Simulated - set ANTHROPIC_API_KEY in .env for Live API)`,
      generatedAt: new Date().toISOString()
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
