import { Request, Response } from 'express';
import { activityService } from '../services/activity/activity.service';

export const activityController = {
  async getActivityLogs(req: Request, res: Response) {
    const session = req.shopSession!;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const activity = await activityService.getRecentActivity(session, limit);

    res.json({
      success: true,
      activity
    });
  }
};
