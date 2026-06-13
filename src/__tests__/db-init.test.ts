import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for src/db/index.ts
 *
 * The module throws an error at import time if DATABASE_URL is not set,
 * and exports a drizzle ORM instance when the env var is present.
 * We use dynamic imports to test both code paths.
 */
describe('src/db/index.ts', () => {
  const ORIGINAL_DATABASE_URL = process.env['DATABASE_URL'];

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original env state
    if (ORIGINAL_DATABASE_URL !== undefined) {
      process.env['DATABASE_URL'] = ORIGINAL_DATABASE_URL;
    } else {
      delete process.env['DATABASE_URL'];
    }
    vi.resetModules();
  });

  describe('when DATABASE_URL is not set', () => {
    it('throws an error on import', async () => {
      delete process.env['DATABASE_URL'];

      await expect(import('../db/index.js')).rejects.toThrow('DATABASE_URL is not defined');
    });

    it('throws an Error instance (not a string or other type)', async () => {
      delete process.env['DATABASE_URL'];

      await expect(import('../db/index.js')).rejects.toBeInstanceOf(Error);
    });

    it('error message is exactly "DATABASE_URL is not defined"', async () => {
      delete process.env['DATABASE_URL'];

      let caughtError: unknown;
      try {
        await import('../db/index.js');
      } catch (err) {
        caughtError = err;
      }

      expect(caughtError).toBeInstanceOf(Error);
      expect((caughtError as Error).message).toBe('DATABASE_URL is not defined');
    });

    it('throws when DATABASE_URL is an empty string', async () => {
      process.env['DATABASE_URL'] = '';

      // The check is `!process.env.DATABASE_URL` which is falsy for empty string
      await expect(import('../db/index.js')).rejects.toThrow('DATABASE_URL is not defined');
    });
  });

  describe('when DATABASE_URL is set', () => {
    it('exports a drizzle db instance named "index"', async () => {
      process.env['DATABASE_URL'] = 'postgresql://user:pass@localhost/testdb';

      const mod = await import('../db/index.js');

      expect(mod.index).toBeDefined();
    });

    it('the exported "index" has drizzle query methods', async () => {
      process.env['DATABASE_URL'] = 'postgresql://user:pass@localhost/testdb';

      const mod = await import('../db/index.js');

      // A drizzle instance exposes select, insert, update, delete methods
      expect(typeof mod.index.select).toBe('function');
      expect(typeof mod.index.insert).toBe('function');
      expect(typeof mod.index.update).toBe('function');
      expect(typeof mod.index.delete).toBe('function');
    });

    it('the exported "index" is not null or undefined', async () => {
      process.env['DATABASE_URL'] = 'postgresql://user:pass@localhost/testdb';

      const mod = await import('../db/index.js');

      expect(mod.index).not.toBeNull();
      expect(mod.index).not.toBeUndefined();
    });
  });
});
