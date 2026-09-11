import { ShopSession, BundleDto, CreateBundleRequest, UpdateBundleRequest, ScoreBreakdown } from '../../types';
import { dbRepository } from '../../db';
import { bundleScoreService } from '../scoring/bundle-score.service';
import { inventoryAlertService } from '../alerts/inventory-alert.service';

export const bundleService = {
  async getBundles(session: ShopSession): Promise<BundleDto[]> {
    const rawBundles = await dbRepository.getBundlesByShop(session.shopId);
    return bundleScoreService.rankBundles(rawBundles);
  },

  async getBundleById(session: ShopSession, id: string): Promise<BundleDto | null> {
    return await dbRepository.getBundleById(id, session.shopId);
  },

  async createBundle(session: ShopSession, data: CreateBundleRequest): Promise<BundleDto> {
    // 1. Insert bundle and items into DB
    const created = await dbRepository.createBundle(session.shopId, {
      name: data.name,
      description: data.description,
      status: data.status || 'draft',
      discountPercent: data.discountPercent,
      targetCategory: data.targetCategory || 'General',
      items: data.items
    });

    // 2. Compute initial deterministic score
    await bundleScoreService.scoreBundle(session, created);

    // 3. Evaluate inventory alerts
    await inventoryAlertService.evaluateAndSyncAlerts(session, created);

    // 4. Create activity log
    await dbRepository.createActivityLog(session.shopId, {
      bundleId: created.id,
      action: 'bundle_created',
      description: `Created new bundle "${created.name}" with ${data.items.length} item(s) and ${created.discountPercent}% discount.`,
      metadata: {
        itemCount: data.items.length,
        discountPercent: created.discountPercent,
        status: created.status
      }
    });

    // 5. Return fresh state
    return (await dbRepository.getBundleById(created.id, session.shopId))!;
  },

  async updateBundle(session: ShopSession, id: string, data: UpdateBundleRequest): Promise<BundleDto | null> {
    const previous = await dbRepository.getBundleById(id, session.shopId);
    if (!previous) return null;

    // Track diffs for audit trail
    const changes: Record<string, { from: any; to: any }> = {};
    if (data.name && data.name !== previous.name) {
      changes.name = { from: previous.name, to: data.name };
    }
    if (data.discountPercent !== undefined && data.discountPercent !== previous.discountPercent) {
      changes.discountPercent = { from: previous.discountPercent, to: data.discountPercent };
    }
    if (data.status && data.status !== previous.status) {
      changes.status = { from: previous.status, to: data.status };
    }

    // 1. Update database
    const updated = await dbRepository.updateBundle(id, session.shopId, data);
    if (!updated) return null;

    // 2. Recalculate score
    await bundleScoreService.scoreBundle(session, updated);

    // 3. Update inventory alerts
    await inventoryAlertService.evaluateAndSyncAlerts(session, updated);

    // 4. Create activity log with diffs
    await dbRepository.createActivityLog(session.shopId, {
      bundleId: id,
      action: 'bundle_updated',
      description: `Updated bundle "${updated.name}". ${Object.keys(changes).length > 0 ? 'Fields modified: ' + Object.keys(changes).join(', ') : ''}`,
      metadata: changes
    });

    return (await dbRepository.getBundleById(id, session.shopId))!;
  },

  async deleteBundle(session: ShopSession, id: string): Promise<boolean> {
    const existing = await dbRepository.getBundleById(id, session.shopId);
    if (!existing) return false;

    const success = await dbRepository.deleteBundle(id, session.shopId);
    if (success) {
      await dbRepository.createActivityLog(session.shopId, {
        bundleId: null,
        action: 'bundle_deleted',
        description: `Deleted bundle "${existing.name}" (ID: ${id}).`,
        metadata: { deletedBundleName: existing.name }
      });
    }
    return success;
  },

  async recalculateScore(session: ShopSession, id: string): Promise<ScoreBreakdown | null> {
    const bundle = await dbRepository.getBundleById(id, session.shopId);
    if (!bundle) return null;

    const previousScore = bundle.score?.totalScore;
    const newScore = await bundleScoreService.scoreBundle(session, bundle);

    await inventoryAlertService.evaluateAndSyncAlerts(session, bundle);

    await dbRepository.createActivityLog(session.shopId, {
      bundleId: id,
      action: 'score_recalculated',
      description: `Recalculated deterministic score for "${bundle.name}": ${newScore.totalScore}/100.`,
      metadata: {
        previousScore: previousScore ?? null,
        newScore: newScore.totalScore,
        factors: {
          sales: newScore.salesScore,
          compatibility: newScore.compatibilityScore,
          inventory: newScore.inventoryScore,
          discount: newScore.discountScore
        }
      }
    });

    return newScore;
  }
};
