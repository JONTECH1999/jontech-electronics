import { ShopSession, ActivityLogDto } from '../../types';
import { dbRepository } from '../../db';

export const activityService = {
  async getRecentActivity(session: ShopSession, limit = 50): Promise<ActivityLogDto[]> {
    return await dbRepository.getActivityLogsByShop(session.shopId, limit);
  },

  async log(data: { shopId: string; bundleId?: string | null; action: string; description: string; metadata?: any }) {
    return await dbRepository.createActivityLog(data.shopId, {
      bundleId: data.bundleId,
      action: data.action,
      description: data.description,
      metadata: data.metadata
    });
  }
};

