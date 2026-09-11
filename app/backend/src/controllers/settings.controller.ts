import { Request, Response } from 'express';
import { env } from '../config/env';

// Shop-level in-memory preferences (customizable per merchant)
const shopSettingsMap = new Map<string, any>();

export const settingsController = {
  getSettings(req: Request, res: Response) {
    const session = req.shopSession!;

    const current = shopSettingsMap.get(session.shopId) || {
      scoringWeights: {
        salesWeight: 0.35,
        compatibilityWeight: 0.25,
        inventoryWeight: 0.20,
        discountWeight: 0.20
      },
      alertThresholds: {
        criticalStock: 2,
        warningStock: 5
      },
      aiPreferences: {
        model: env.ANTHROPIC_MODEL,
        autoAnalyzeOnCreate: false
      }
    };

    res.json({
      success: true,
      settings: current
    });
  },

  updateSettings(req: Request, res: Response) {
    const session = req.shopSession!;
    const updated = req.body;

    shopSettingsMap.set(session.shopId, updated);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updated
    });
  }
};
