import { Request, Response } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';
import { dbRepository } from '../db';

// Nonce storage with 10-minute TTL to prevent replay attacks and CSRF
interface NonceEntry {
  state: string;
  shop: string;
  expiresAt: number;
}
const nonceStore = new Map<string, NonceEntry>();

/**
 * Validates whether a domain matches Shopify's myshopify.com format
 */
export function isValidShopifyDomain(shop: string): boolean {
  if (!shop || typeof shop !== 'string') return false;
  const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
  return shopRegex.test(shop);
}

/**
 * Cryptographically verifies Shopify HMAC signature (SHA256)
 * Follows Shopify's specification:
 * 1. Remove 'hmac' and 'signature' keys
 * 2. Lexicographically sort remaining query parameter keys
 * 3. Serialize as key=value pairs joined with '&'
 * 4. Compute HMAC SHA-256 with API secret
 * 5. Compare using timingSafeEqual to guard against timing attacks
 */
export function verifyShopifyHmac(query: Record<string, any>, apiSecret: string): boolean {
  const { hmac, signature, ...rest } = query;
  if (!hmac || typeof hmac !== 'string') return false;

  // Sort parameters alphabetically by key
  const orderedParams = Object.keys(rest)
    .sort()
    .map(key => {
      const val = rest[key];
      return `${key}=${Array.isArray(val) ? val.join(',') : val}`;
    })
    .join('&');

  const calculatedHmac = crypto
    .createHmac('sha256', apiSecret)
    .update(orderedParams)
    .digest('hex');

  // Use timing-safe buffer comparison to guard against timing attacks
  const calculatedBuffer = Buffer.from(calculatedHmac, 'utf-8');
  const receivedBuffer = Buffer.from(hmac, 'utf-8');

  if (calculatedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(calculatedBuffer, receivedBuffer);
}

/**
 * Generates and stores a secure state nonce
 */
export function generateStateNonce(shop: string): string {
  const state = crypto.randomBytes(16).toString('hex');
  const now = Date.now();
  nonceStore.set(state, {
    state,
    shop,
    expiresAt: now + 10 * 60 * 1000 // 10 minutes
  });

  // Clean up expired nonces
  for (const [key, entry] of nonceStore.entries()) {
    if (entry.expiresAt < now) {
      nonceStore.delete(key);
    }
  }

  return state;
}

/**
 * Verifies that a state nonce is valid and matches the given shop
 */
export function verifyStateNonce(state: string, shop: string): boolean {
  if (!state) return false;
  const entry = nonceStore.get(state);
  if (!entry) return false;

  const isValid = entry.shop.toLowerCase() === shop.toLowerCase() && entry.expiresAt > Date.now();
  // Consume nonce immediately to prevent replay
  nonceStore.delete(state);
  return isValid;
}

export const authController = {
  /**
   * Initiates Shopify OAuth flow
   */
  async install(req: Request, res: Response) {
    let shop = (req.query.shop as string)?.trim().toLowerCase();

    // In demo mode or local testing, fallback to demo domain if none provided
    if (!shop && (env.USE_DEMO_DATA || process.env.NODE_ENV !== 'production')) {
      shop = env.DEMO_SHOP_DOMAIN;
    }

    if (!shop || !isValidShopifyDomain(shop)) {
      return res.status(400).send('Invalid or missing shop parameter. Must be in the format {store-name}.myshopify.com');
    }

    // In demo mode with demo domain, permit direct bypass for quick local evaluation
    if (env.USE_DEMO_DATA && shop === env.DEMO_SHOP_DOMAIN) {
      const host = (req.query.host as string) || Buffer.from(`${shop}/admin`).toString('base64');
      return res.redirect(`/auth/callback?shop=${encodeURIComponent(shop)}&code=demo_auth_code&host=${encodeURIComponent(host)}`);
    }

    // Generate secure state nonce and redirect to Shopify OAuth authorize endpoint
    const state = generateStateNonce(shop);
    const redirectUri = `${env.SHOPIFY_APP_URL}/auth/callback`;
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${encodeURIComponent(env.SHOPIFY_API_KEY)}&scope=${encodeURIComponent(env.SHOPIFY_SCOPES)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;

    res.redirect(installUrl);
  },

  /**
   * Handles Shopify OAuth callback and token exchange
   */
  async callback(req: Request, res: Response) {
    const shop = (req.query.shop as string)?.trim().toLowerCase();
    const code = req.query.code as string;
    const state = req.query.state as string;
    const host = req.query.host as string;

    if (!shop || !isValidShopifyDomain(shop)) {
      return res.status(400).send('Invalid or missing shop parameter.');
    }

    const isDemoBypass = env.USE_DEMO_DATA && code === 'demo_auth_code' && shop === env.DEMO_SHOP_DOMAIN;

    if (!isDemoBypass) {
      // 1. Verify HMAC cryptographic signature
      if (req.query.hmac) {
        const isValidHmac = verifyShopifyHmac(req.query as Record<string, any>, env.SHOPIFY_API_SECRET);
        if (!isValidHmac) {
          return res.status(403).send('HMAC validation failed. The callback request signature is invalid or tampered.');
        }
      } else {
        return res.status(400).send('Missing required HMAC signature from Shopify authorization callback.');
      }

      // 2. Verify state/nonce to prevent CSRF attacks
      if (!verifyStateNonce(state, shop)) {
        return res.status(403).send('Invalid or expired OAuth state nonce. Please re-initiate installation.');
      }
    }

    let accessToken = 'shpat_demo_access_token_kitflow_secure';

    // 3. Exchange authorization code for permanent offline access token
    if (!isDemoBypass && code) {
      try {
        const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            client_id: env.SHOPIFY_API_KEY,
            client_secret: env.SHOPIFY_API_SECRET,
            code
          })
        });

        if (!tokenResponse.ok) {
          const errBody = await tokenResponse.text();
          throw new Error(`Shopify token exchange responded with HTTP ${tokenResponse.status}: ${errBody}`);
        }

        const tokenData: any = await tokenResponse.json();
        if (!tokenData || !tokenData.access_token) {
          throw new Error('Access token missing from Shopify response payload.');
        }
        accessToken = tokenData.access_token;
      } catch (err: any) {
        console.error('Failed to exchange Shopify token:', err.message);
        return res.status(502).send(`OAuth token exchange failed: ${err.message}`);
      }
    }

    // 4. Provision or update shop record in database
    await dbRepository.upsertShop({
      shopifyDomain: shop,
      accessToken,
      scope: env.SHOPIFY_SCOPES
    });

    // 5. Redirect to embedded app dashboard inside Shopify Admin with App Bridge host parameter
    const appBridgeHost = host || Buffer.from(`${shop}/admin`).toString('base64');
    res.redirect(`/app?shop=${encodeURIComponent(shop)}&host=${encodeURIComponent(appBridgeHost)}`);
  },

  /**
   * Verifies current session status
   */
  async session(req: Request, res: Response) {
    if (!req.shopSession) {
      return res.status(401).json({ authenticated: false });
    }

    const isDemo = env.USE_DEMO_DATA || !req.shopSession.accessToken || req.shopSession.accessToken.startsWith('shpat_demo') || req.shopSession.accessToken === 'test_token';

    res.json({
      authenticated: true,
      shop: req.shopSession.shopifyDomain,
      shopId: req.shopSession.shopId,
      isDemoMode: isDemo,
      apiVersion: env.SHOPIFY_API_VERSION
    });
  }
};
