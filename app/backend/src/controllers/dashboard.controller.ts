import { Request, Response } from 'express';
import { bundleService } from '../services/bundles/bundle.service';
import { dbRepository } from '../db';
import { activityService } from '../services/activity/activity.service';
import { env } from '../config/env';

export const dashboardController = {
  async getDashboardData(req: Request, res: Response) {
    const session = req.shopSession!;

    // 1. Fetch all bundles for this shop
    const bundles = await bundleService.getBundles(session);

    // 2. Fetch active alerts
    const alerts = await dbRepository.getAlertsByShop(session.shopId, 'active');

    // 3. Fetch recent activity
    const activity = await activityService.getRecentActivity(session, 10);

    // 4. Calculate KPI metrics
    const totalBundles = bundles.length;
    const activeBundles = bundles.filter(b => b.status === 'active').length;

    const scoredBundles = bundles.filter(b => b.score && b.score.totalScore > 0);
    const avgScore = scoredBundles.length > 0
      ? Math.round((scoredBundles.reduce((sum, b) => sum + (b.score?.totalScore || 0), 0) / scoredBundles.length) * 10) / 10
      : 0;

    const needingAttention = bundles.filter(b => (b.activeAlertCount || 0) > 0 || ((b.score?.totalScore || 0) < 70 && b.status === 'active')).length;

    // 5. Extract top AI insights from recent analyses
    const aiInsights: Array<{ bundleName: string; summary: string; recommendation: string }> = [];
    for (const b of bundles) {
      if (b.latestAnalysis) {
        aiInsights.push({
          bundleName: b.name,
          summary: b.latestAnalysis.summary,
          recommendation: b.latestAnalysis.recommendations[0] || 'Monitor bundle metrics.'
        });
      }
    }

    res.json({
      success: true,
      isDemoMode: env.USE_DEMO_DATA,
      apiVersion: env.SHOPIFY_API_VERSION,
      kpis: {
        totalBundles,
        activeBundles,
        averageScore: avgScore,
        needingAttention
      },
      topBundles: bundles.slice(0, 5),
      recentAlerts: alerts.slice(0, 5),
      recentActivity: activity,
      aiInsights: aiInsights.slice(0, 3)
    });
  }
};
