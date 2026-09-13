import { Request, Response, NextFunction } from 'express';
import { shopifyCustomersService } from '../services/shopify/customers.service';
import { activityService } from '../services/activity/activity.service';

export const customerController = {
  async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = req.shopSession!;
      const q = typeof req.query.q === 'string' ? req.query.q : undefined;
      const result = await shopifyCustomersService.getCustomers(session, q);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getCustomerById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = req.shopSession!;
      const customer = await shopifyCustomersService.getCustomerById(session, req.params.id);
      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
      res.status(200).json(customer);
    } catch (error) {
      next(error);
    }
  },

  async syncCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = req.shopSession!;
      const result = await shopifyCustomersService.getCustomers(session);
      await activityService.log({
        shopId: session.shopId,
        action: 'customers_synced',
        description: `Synchronized ${result.totalCount} customer accounts from ${result.source === 'shopify' ? 'Shopify Admin API' : 'store simulation'}.`,
        metadata: { totalCount: result.totalCount, source: result.source }
      });

      res.status(200).json({
        success: true,
        message: `Successfully synchronized ${result.totalCount} customers.`,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
};
