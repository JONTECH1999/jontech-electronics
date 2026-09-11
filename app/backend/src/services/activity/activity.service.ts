import { ShopSession, ActivityLogDto } from '../../types';
import { dbRepository } from '../../db';

export const activityService = {
  async getRecentActivity(session: ShopSession, limit = 50): Promise<ActivityLogDto[]> {
    return await dbRepository.getActivityLogsByShop(session.shopId, limit);
  }
};
