import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  isValidShopifyDomain,
  verifyShopifyHmac,
  generateStateNonce,
  verifyStateNonce
} from '../../backend/src/controllers/auth.controller';

describe('Shopify OAuth Security and Verification', () => {
  const TEST_SECRET = 'shpss_test_secret_key_849204910';

  describe('Shopify Domain Validation', () => {
    it('accepts valid myshopify.com domains', () => {
      expect(isValidShopifyDomain('quickstart-store.myshopify.com')).toBe(true);
      expect(isValidShopifyDomain('jontech-store.myshopify.com')).toBe(true);
      expect(isValidShopifyDomain('my-cool-store-2026.myshopify.com')).toBe(true);
    });

    it('rejects invalid or potentially malicious domains', () => {
      expect(isValidShopifyDomain('evil.com')).toBe(false);
      expect(isValidShopifyDomain('notshopify.com')).toBe(false);
      expect(isValidShopifyDomain('http://store.myshopify.com')).toBe(false);
      expect(isValidShopifyDomain('store.myshopify.com/admin')).toBe(false);
      expect(isValidShopifyDomain('-invalid.myshopify.com')).toBe(false);
      expect(isValidShopifyDomain('')).toBe(false);
      expect(isValidShopifyDomain(null as any)).toBe(false);
    });
  });

  describe('Cryptographic HMAC SHA256 Verification', () => {
    it('successfully verifies a correctly signed Shopify query map', () => {
      const queryParams: Record<string, any> = {
        code: '0907a61c0c8d55e99db179b68161bc00',
        shop: 'jontech-electronics.myshopify.com',
        state: '0f837482374928174823749281748237',
        timestamp: '1773289200'
      };

      // Compute valid HMAC in test
      const ordered = Object.keys(queryParams)
        .sort()
        .map(k => `${k}=${queryParams[k]}`)
        .join('&');
      const validHmac = crypto.createHmac('sha256', TEST_SECRET).update(ordered).digest('hex');

      const fullQuery = {
        ...queryParams,
        hmac: validHmac
      };

      expect(verifyShopifyHmac(fullQuery, TEST_SECRET)).toBe(true);
    });

    it('rejects HMAC if query parameters were tampered with', () => {
      const queryParams: Record<string, any> = {
        code: '0907a61c0c8d55e99db179b68161bc00',
        shop: 'jontech-electronics.myshopify.com',
        state: '0f837482374928174823749281748237',
        timestamp: '1773289200'
      };

      const ordered = Object.keys(queryParams)
        .sort()
        .map(k => `${k}=${queryParams[k]}`)
        .join('&');
      const validHmac = crypto.createHmac('sha256', TEST_SECRET).update(ordered).digest('hex');

      // Attacker tampers with the code parameter
      const tamperedQuery = {
        ...queryParams,
        code: 'attacker_injected_code',
        hmac: validHmac
      };

      expect(verifyShopifyHmac(tamperedQuery, TEST_SECRET)).toBe(false);
    });

    it('rejects HMAC if signed with an incorrect secret', () => {
      const queryParams: Record<string, any> = {
        code: '0907a61c0c8d55e99db179b68161bc00',
        shop: 'jontech-electronics.myshopify.com',
        timestamp: '1773289200'
      };

      const ordered = Object.keys(queryParams).sort().map(k => `${k}=${queryParams[k]}`).join('&');
      const wrongSecretHmac = crypto.createHmac('sha256', 'wrong_secret').update(ordered).digest('hex');

      expect(verifyShopifyHmac({ ...queryParams, hmac: wrongSecretHmac }, TEST_SECRET)).toBe(false);
    });

    it('rejects verification if hmac is missing or malformed', () => {
      expect(verifyShopifyHmac({ code: 'xyz', shop: 'test.myshopify.com' }, TEST_SECRET)).toBe(false);
      expect(verifyShopifyHmac({ hmac: '' }, TEST_SECRET)).toBe(false);
    });
  });

  describe('State Nonce Anti-CSRF Protection', () => {
    it('generates, validates, and consumes nonces in a single-use manner', () => {
      const shop = 'jontech-electronics.myshopify.com';
      const nonce = generateStateNonce(shop);

      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBe(32); // 16 bytes hex

      // First verification must succeed
      expect(verifyStateNonce(nonce, shop)).toBe(true);

      // Second verification must fail because nonce is single-use
      expect(verifyStateNonce(nonce, shop)).toBe(false);
    });

    it('rejects nonce if shop does not match', () => {
      const shop = 'jontech-electronics.myshopify.com';
      const nonce = generateStateNonce(shop);

      // Attacker attempts to redeem nonce for a different store
      expect(verifyStateNonce(nonce, 'attacker-store.myshopify.com')).toBe(false);
    });
  });
});
