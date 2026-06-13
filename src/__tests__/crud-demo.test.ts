import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Tests for src/crud-demo.ts
 *
 * The module performs CRUD operations against the database using drizzle ORM.
 * We mock both the db module and the schema to test the logic in isolation.
 */

// Mock the db module before any imports
vi.mock('../db/index.js', () => {
  const mockDb = {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return { index: mockDb };
});

// Mock the schema module
vi.mock('../db/schema/index.js', () => {
  return {
    demoUsers: { id: {}, name: {}, email: {} },
  };
});

// Also mock drizzle-orm eq since it's imported by crud-demo
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val })),
}));

// Helper: build a full chainable mock for insert(...).values(...).returning()
function makeInsertMock(returnValue: unknown[]) {
  const returningMock = vi.fn().mockResolvedValue(returnValue);
  const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
  const insertMock = vi.fn().mockReturnValue({ values: valuesMock });
  return { insertMock, valuesMock, returningMock };
}

// Helper: build a chainable mock for select().from(...).where(...)
function makeSelectMock(returnValue: unknown[]) {
  const whereMock = vi.fn().mockResolvedValue(returnValue);
  const fromMock = vi.fn().mockReturnValue({ where: whereMock });
  const selectMock = vi.fn().mockReturnValue({ from: fromMock });
  return { selectMock, fromMock, whereMock };
}

// Helper: build a chainable mock for update(...).set(...).where(...).returning()
function makeUpdateMock(returnValue: unknown[]) {
  const returningMock = vi.fn().mockResolvedValue(returnValue);
  const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
  const setMock = vi.fn().mockReturnValue({ where: whereMock });
  const updateMock = vi.fn().mockReturnValue({ set: setMock });
  return { updateMock, setMock, whereMock, returningMock };
}

// Helper: build a chainable mock for delete(...).where(...)
function makeDeleteMock() {
  const whereMock = vi.fn().mockResolvedValue([]);
  const deleteMock = vi.fn().mockReturnValue({ where: whereMock });
  return { deleteMock, whereMock };
}

describe('crud-demo main()', () => {
  let indexModule: { index: ReturnType<typeof vi.fn> & Record<string, ReturnType<typeof vi.fn>> };
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  const mockUser = {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    createdAt: new Date(),
  };
  const updatedMockUser = { ...mockUser, name: 'Super Admin' };

  beforeEach(async () => {
    vi.resetModules();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);

    // Re-import the mocked db module to get fresh references
    indexModule = (await import('../db/index.js')) as typeof indexModule;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('successful CRUD flow', () => {
    beforeEach(() => {
      const { insertMock } = makeInsertMock([mockUser]);
      const { selectMock } = makeSelectMock([mockUser]);
      const { updateMock } = makeUpdateMock([updatedMockUser]);
      const { deleteMock } = makeDeleteMock();

      indexModule.index.insert = insertMock;
      indexModule.index.select = selectMock;
      indexModule.index.update = updateMock;
      indexModule.index.delete = deleteMock;
    });

    it('calls insert with the correct table', async () => {
      const { demoUsers } = await import('../db/schema/index.js');
      await import('../crud-demo.js');

      expect(indexModule.index.insert).toHaveBeenCalledWith(demoUsers);
    });

    it('calls insert values with name "Admin User" and email "admin@example.com"', async () => {
      await import('../crud-demo.js');

      const insertChain = indexModule.index.insert.mock.results[0]?.value as {
        values: ReturnType<typeof vi.fn>;
      };
      expect(insertChain.values).toHaveBeenCalledWith({
        name: 'Admin User',
        email: 'admin@example.com',
      });
    });

    it('calls select after insert to read the user', async () => {
      await import('../crud-demo.js');

      expect(indexModule.index.select).toHaveBeenCalled();
    });

    it('calls update with the correct new name', async () => {
      await import('../crud-demo.js');

      const updateChain = indexModule.index.update.mock.results[0]?.value as {
        set: ReturnType<typeof vi.fn>;
      };
      expect(updateChain.set).toHaveBeenCalledWith({ name: 'Super Admin' });
    });

    it('calls delete after update', async () => {
      await import('../crud-demo.js');

      expect(indexModule.index.delete).toHaveBeenCalled();
    });

    it('logs success messages for all four CRUD operations', async () => {
      await import('../crud-demo.js');

      const logCalls = consoleLogSpy.mock.calls.map((c) => c[0]);
      const hasCreate = logCalls.some((m) => typeof m === 'string' && m.includes('CREATE'));
      const hasRead = logCalls.some((m) => typeof m === 'string' && m.includes('READ'));
      const hasUpdate = logCalls.some((m) => typeof m === 'string' && m.includes('UPDATE'));
      const hasDelete = logCalls.some((m) => typeof m === 'string' && m.includes('DELETE'));

      expect(hasCreate).toBe(true);
      expect(hasRead).toBe(true);
      expect(hasUpdate).toBe(true);
      expect(hasDelete).toBe(true);
    });

    it('does not call process.exit on success', async () => {
      await import('../crud-demo.js');

      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('logs final completion message', async () => {
      await import('../crud-demo.js');

      const logMessages = consoleLogSpy.mock.calls.map((c) => c[0] as string);
      expect(logMessages.some((m) => m?.includes('completed successfully'))).toBe(true);
    });
  });

  describe('error handling: insert returns no user', () => {
    beforeEach(() => {
      // Simulate insert returning empty array (no user created)
      const { insertMock } = makeInsertMock([]);
      indexModule.index.insert = insertMock;
    });

    it('logs an error when insert returns no result', async () => {
      await import('../crud-demo.js');

      // Give async operations a moment to settle
      await new Promise((r) => setTimeout(r, 10));

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('calls process.exit(1) when insert fails', async () => {
      await import('../crud-demo.js');

      await new Promise((r) => setTimeout(r, 10));

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('error handling: update returns no user', () => {
    beforeEach(() => {
      const { insertMock } = makeInsertMock([mockUser]);
      const { selectMock } = makeSelectMock([mockUser]);
      // Simulate update returning empty array
      const { updateMock } = makeUpdateMock([]);
      indexModule.index.insert = insertMock;
      indexModule.index.select = selectMock;
      indexModule.index.update = updateMock;
    });

    it('logs an error when update returns no result', async () => {
      await import('../crud-demo.js');

      await new Promise((r) => setTimeout(r, 10));

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('calls process.exit(1) when update fails', async () => {
      await import('../crud-demo.js');

      await new Promise((r) => setTimeout(r, 10));

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('error handling: DB throws on insert', () => {
    beforeEach(() => {
      const returningMock = vi.fn().mockRejectedValue(new Error('DB connection failed'));
      const valuesMock = vi.fn().mockReturnValue({ returning: returningMock });
      indexModule.index.insert = vi.fn().mockReturnValue({ values: valuesMock });
    });

    it('catches the error and logs it', async () => {
      await import('../crud-demo.js');

      await new Promise((r) => setTimeout(r, 10));

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('calls process.exit(1) when DB throws', async () => {
      await import('../crud-demo.js');

      await new Promise((r) => setTimeout(r, 10));

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('error handling: DB throws on select', () => {
    beforeEach(() => {
      const { insertMock } = makeInsertMock([mockUser]);
      const whereMock = vi.fn().mockRejectedValue(new Error('select failed'));
      const fromMock = vi.fn().mockReturnValue({ where: whereMock });
      const selectMock = vi.fn().mockReturnValue({ from: fromMock });

      indexModule.index.insert = insertMock;
      indexModule.index.select = selectMock;
    });

    it('calls process.exit(1) when select fails', async () => {
      await import('../crud-demo.js');

      await new Promise((r) => setTimeout(r, 10));

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('error handling: DB throws on delete', () => {
    beforeEach(() => {
      const { insertMock } = makeInsertMock([mockUser]);
      const { selectMock } = makeSelectMock([mockUser]);
      const { updateMock } = makeUpdateMock([updatedMockUser]);
      const whereMock = vi.fn().mockRejectedValue(new Error('delete failed'));
      const deleteMock = vi.fn().mockReturnValue({ where: whereMock });

      indexModule.index.insert = insertMock;
      indexModule.index.select = selectMock;
      indexModule.index.update = updateMock;
      indexModule.index.delete = deleteMock;
    });

    it('calls process.exit(1) when delete fails', async () => {
      await import('../crud-demo.js');

      await new Promise((r) => setTimeout(r, 10));

      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});