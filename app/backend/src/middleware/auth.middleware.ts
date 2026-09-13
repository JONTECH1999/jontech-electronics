import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { dbRepository } from '../db';
import { env } from '../config/env';
import { ShopSession } from '../types';

declare global {
  namespace Express {
    interface Request {
      shopSession?: ShopSession;
    }
  }
}

/**
 * Shopify Embedded App Authentication & Shop Context Isolation Middleware
 * Resolves verified shop context from headers, session token, or fallback demo context
 */
export async function requireShopAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Check for Shopify Shop Domain in header (standard App Bridge or reverse proxy)
    const domainHeader = (req.headers['x-shopify-shop-domain'] as string) || (req.query.shop as string);

    // 2. Check for Authorization Bearer (JWT session token from App Bridge)
    const authHeader = req.headers.authorization;
    let shopDomain = domainHeader;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (env.NODE_ENV === 'production') {
        try {
          const payload = jwt.verify(token, env.SHOPIFY_API_SECRET, {
            algorithms: ['HS256'],
            audience: env.SHOPIFY_API_KEY
          }) as JwtPayload;
          const destination = typeof payload.dest === 'string' ? new URL(payload.dest) : null;
          const tokenShopDomain = destination?.protocol === 'https:' ? destination.hostname.toLowerCase() : '';

          if (!tokenShopDomain || !isValidShopDomain(tokenShopDomain) || payload.iss !== `https://${tokenShopDomain}/admin`) {
            throw new Error('Invalid Shopify ID token claims.');
          }
          if (domainHeader && domainHeader.toLowerCase() !== tokenShopDomain) {
            return res.status(403).json({ success: false, error: 'Shop context does not match the authenticated Shopify session.' });
          }
          shopDomain = tokenShopDomain;
        } catch {
          return res.status(401).json({ success: false, error: 'Invalid or expired Shopify ID token.' });
        }
      }
      // In production, verify Shopify session token JWT payload (iss, dest)
      // dest is e.g. "https://store-name.myshopify.com"
      try {
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (decoded && decoded.dest) {
          shopDomain = decoded.dest.replace(/^https?:\/\//, '');
        }
      } catch (e) {
        // Fall back to domain header
      }
    }
    if (env.NODE_ENV === 'production' && !authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'A Shopify ID token is required for production API requests.' });
    }

    // Default to demo domain if none provided and running in development
    if (!shopDomain && (env.USE_DEMO_DATA || env.NODE_ENV === 'development')) {
      shopDomain = env.DEMO_SHOP_DOMAIN;
    }

    if (!shopDomain) {
      return res.status(401).json({
        success: false,
        error: 'Missing Shopify shop domain context or invalid session token.'
      });
    }

    // Lookup merchant shop record in database
    let shop = await dbRepository.getShopByDomain(shopDomain);
    const configuredToken = (env.SHOPIFY_ADMIN_ACCESS_TOKEN && env.SHOPIFY_ADMIN_ACCESS_TOKEN.trim().startsWith('shpat_'))
      ? env.SHOPIFY_ADMIN_ACCESS_TOKEN.trim()
      : 'shpat_demo_access_token_kitflow_secure';

    if (!shop) {
      if (env.USE_DEMO_DATA || shopDomain === env.DEMO_SHOP_DOMAIN || env.NODE_ENV === 'development') {
        // Auto-provision shop for seamless testing or live connection
        shop = await dbRepository.upsertShop({
          shopifyDomain: shopDomain,
          accessToken: configuredToken,
          scope: env.SHOPIFY_SCOPES,
          shopifyStoreId: 'gid://shopify/Shop/jontech_electronics'
        });
      } else {
        return res.status(403).json({
          success: false,
          error: `Shop ${shopDomain} has not completed KitFlow OAuth installation.`
        });
      }
    } else if (env.NODE_ENV !== 'production' && configuredToken !== 'shpat_demo_access_token_kitflow_secure' && shop.accessToken !== configuredToken) {
      // Automatically synchronize updated Shopify Admin API access token from environment
      shop = await dbRepository.upsertShop({
        shopifyDomain: shopDomain,
        accessToken: configuredToken,
        scope: env.SHOPIFY_SCOPES,
        shopifyStoreId: shop.shopifyStoreId || 'gid://shopify/Shop/jontech_electronics'
      });
    }

    // Inject isolated shop session into request
    req.shopSession = {
      shopId: shop.id,
      shopifyDomain: shop.shopifyDomain,
      accessToken: shop.accessToken
    };

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication verification failed.'
    });
  }
}

function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/.test(shop);
}
