import { Request, Response } from 'express';
import { dbRepository } from '../db';

export const alertController = {
  async listAlerts(req: Request, res: Response) {
    const session = req.shopSession!;
    const status = req.query.status as string; // 'active', 'resolved', or undefined

    const alerts = await dbRepository.getAlertsByShop(session.shopId, status);

    res.json({
      success: true,
      alerts
    });
  },

  async resolveAlert(req: Request, res: Response) {
    const session = req.shopSession!;
    const { id } = req.params;

    await dbRepository.resolveAlert(id, session.shopId);

    await dbRepository.createActivityLog(session.shopId, {
      action: 'alert_resolved',
      description: `Merchant resolved alert ID: ${id}.`,
      metadata: { alertId: id }
    });

    res.json({
      success: true,
      message: 'Alert resolved successfully'
    });
  }
};
