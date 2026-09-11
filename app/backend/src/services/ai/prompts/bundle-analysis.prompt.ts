export function buildBundleAnalysisPrompt(bundleData: {
  bundleName: string;
  category: string;
  discountPercent: number;
  totalScore: number;
  salesScore: number;
  compatibilityScore: number;
  inventoryScore: number;
  discountScore: number;
  items: Array<{ title: string; price: number; quantity: number }>;
  inventoryStatus: { lowestStock: number; criticalCount: number; warningCount: number };
  activeAlerts: Array<{ title: string; severity: string; message: string }>;
}): { system: string; user: string } {
  const system = `You are the KitFlow AI Electronics Hardware & Bundle Analyst for JonTech Electronics (Shopify Merchant).
Your role is to provide objective, actionable, data-grounded engineering and merchandising guidance for embedded electronics, microcontrollers, IoT, sensors, and robotics student kits.

CRITICAL CONSTRAINTS:
1. Ground your technical assessment in electronics engineering: verify microcontroller (MCU) / single-board computer (SBC) logic levels (3.3V vs 5V), bus protocols (I2C, SPI, UART, PWM, GPIO), sensor power requirements, and breadboard/prototyping form factors.
2. Explicitly name the included hardware products (e.g., ESP32, Arduino Uno, STM32, Raspberry Pi 4, DHT22, HC-SR04, LiDAR, OLED, motor driver, relays, servos) and how they interface with one another in student/maker applications.
3. NEVER invent or hallucinate metrics, prices, or product names not provided in the input.
4. The numeric score is strictly deterministic and calculated by the business engine. DO NOT recalculate or contradict the numeric scores.
5. Highlight inventory risks if any item has low or critical stock (e.g. TFmini-S LiDAR with <= 2 units).
6. Return ONLY a valid JSON object with the exact keys: "summary", "strengths", "risks", "recommendations".
7. Do NOT include markdown code blocks (such as \`\`\`json) or conversational preamble. Return pure parseable JSON.`;

  const user = `Analyze the following Shopify product bundle:

BUNDLE DETAILS:
- Name: "${bundleData.bundleName}"
- Target Category: ${bundleData.category}
- Configured Discount: ${bundleData.discountPercent}%
- Current Overall Deterministic Score: ${bundleData.totalScore}/100

DETERMINISTIC FACTOR SCORES:
- Sales Performance Score: ${bundleData.salesScore}/100 (Weight: 35%)
- Hardware Compatibility Score: ${bundleData.compatibilityScore}/100 (Weight: 25%)
- Inventory Health Score: ${bundleData.inventoryScore}/100 (Weight: 20%)
- Discount Efficiency Score: ${bundleData.discountScore}/100 (Weight: 20%)

INCLUDED PRODUCTS:
${bundleData.items.map((it, idx) => `  ${idx + 1}. ${it.title} (Price: ₱${it.price.toLocaleString()}, Quantity: ${it.quantity})`).join('\n')}

INVENTORY TELEMETRY:
- Lowest Stock on any item: ${bundleData.inventoryStatus.lowestStock} units
- Critical items (<= 2 units): ${bundleData.inventoryStatus.criticalCount}
- Warning items (<= 5 units): ${bundleData.inventoryStatus.warningCount}

ACTIVE ENGINE ALERTS:
${bundleData.activeAlerts.length > 0
  ? bundleData.activeAlerts.map(a => `  [${a.severity.toUpperCase()}] ${a.title}: ${a.message}`).join('\n')
  : '  No active alerts.'}

Respond with a JSON object strictly following this format:
{
  "summary": "2-3 concise sentences summarizing performance, compatibility, and core urgency.",
  "strengths": [
    "2 to 4 bullet points of genuine verifiable strengths supported by the metrics"
  ],
  "risks": [
    "1 to 3 bullet points highlighting real inventory, margin, or compatibility risks"
  ],
  "recommendations": [
    "2 to 4 actionable, concrete steps the merchant can take immediately"
  ]
}`;

  return { system, user };
}
