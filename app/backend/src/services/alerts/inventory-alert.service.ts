import { ShopSession, BundleDto } from '../../types';
import { shopifyInventoryService } from '../shopify/inventory.service';
import { dbRepository } from '../../db';

export const inventoryAlertService = {
  /**
   * Evaluates inventory risks for a bundle and updates active alerts accordingly
   */
  async evaluateAndSyncAlerts(session: ShopSession, bundle: BundleDto): Promise<void> {
    const health = await shopifyInventoryService.evaluateBundleInventory(session, bundle.items);

    if (health.criticalItems.length > 0) {
      const itemsList = health.criticalItems.map(i => `${i.productTitle} (${i.stock} left)`).join(', ');
      await dbRepository.upsertAlert(session.shopId, {
        bundleId: bundle.id,
        type: 'inventory_critical',
        severity: 'critical',
        title: `Critical Stock Exhaustion in ${bundle.name}`,
        message: `Bundle fulfillment is at immediate risk. The following item(s) have critical inventory (<= 2 units): ${itemsList}.`
      });

      await dbRepository.createActivityLog(session.shopId, {
        bundleId: bundle.id,
        action: 'inventory_alert_triggered',
        description: `Critical inventory alert triggered for "${bundle.name}": stock <= 2 on ${health.criticalItems[0].productTitle}.`,
        metadata: { severity: 'critical', items: health.criticalItems }
      });
    } else if (health.warningItems.length > 0) {
      const itemsList = health.warningItems.map(i => `${i.productTitle} (${i.stock} left)`).join(', ');
      await dbRepository.upsertAlert(session.shopId, {
        bundleId: bundle.id,
        type: 'inventory_warning',
        severity: 'warning',
        title: `Low Stock Warning in ${bundle.name}`,
        message: `Inventory is running low on bundle component(s): ${itemsList}. Consider restocking soon to avoid stockouts.`
      });

      await dbRepository.createActivityLog(session.shopId, {
        bundleId: bundle.id,
        action: 'inventory_alert_triggered',
        description: `Low inventory warning triggered for "${bundle.name}": stock <= 5 on ${health.warningItems[0].productTitle}.`,
        metadata: { severity: 'warning', items: health.warningItems }
      });
    }
  }
};
