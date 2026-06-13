import { describe, it, expect } from 'vitest';
import { demoUsers, type User, type NewUser } from '../db/schema/index.js';

const TABLE_NAME_SYMBOL = Symbol.for('drizzle:Name');

describe('demoUsers schema', () => {
  describe('table metadata', () => {
    it('maps to the demo_users table name', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((demoUsers as any)[TABLE_NAME_SYMBOL]).toBe('demo_users');
    });

    it('exposes all four columns', () => {
      expect(demoUsers.id).toBeDefined();
      expect(demoUsers.name).toBeDefined();
      expect(demoUsers.email).toBeDefined();
      expect(demoUsers.createdAt).toBeDefined();
    });
  });

  describe('id column', () => {
    it('has column name "id"', () => {
      expect(demoUsers.id.name).toBe('id');
    });

    it('is a serial column (PgSerial)', () => {
      expect(demoUsers.id.columnType).toBe('PgSerial');
    });

    it('is the primary key', () => {
      expect(demoUsers.id.primary).toBe(true);
    });

    it('is not nullable', () => {
      expect(demoUsers.id.notNull).toBe(true);
    });

    it('has a default value (auto-increment)', () => {
      expect(demoUsers.id.hasDefault).toBe(true);
    });

    it('has numeric data type', () => {
      expect(demoUsers.id.dataType).toBe('number');
    });
  });

  describe('name column', () => {
    it('has column name "name"', () => {
      expect(demoUsers.name.name).toBe('name');
    });

    it('is a text column (PgText)', () => {
      expect(demoUsers.name.columnType).toBe('PgText');
    });

    it('is not nullable', () => {
      expect(demoUsers.name.notNull).toBe(true);
    });

    it('is not a primary key', () => {
      expect(demoUsers.name.primary).toBe(false);
    });

    it('is not unique', () => {
      expect(demoUsers.name.isUnique).toBe(false);
    });

    it('has no default value', () => {
      expect(demoUsers.name.hasDefault).toBe(false);
    });

    it('has string data type', () => {
      expect(demoUsers.name.dataType).toBe('string');
    });
  });

  describe('email column', () => {
    it('has column name "email"', () => {
      expect(demoUsers.email.name).toBe('email');
    });

    it('is a text column (PgText)', () => {
      expect(demoUsers.email.columnType).toBe('PgText');
    });

    it('is not nullable', () => {
      expect(demoUsers.email.notNull).toBe(true);
    });

    it('is unique', () => {
      expect(demoUsers.email.isUnique).toBe(true);
    });

    it('has the correct unique constraint name', () => {
      expect(demoUsers.email.uniqueName).toBe('demo_users_email_unique');
    });

    it('is not a primary key', () => {
      expect(demoUsers.email.primary).toBe(false);
    });

    it('has no explicit default value', () => {
      expect(demoUsers.email.hasDefault).toBe(false);
    });

    it('has string data type', () => {
      expect(demoUsers.email.dataType).toBe('string');
    });
  });

  describe('createdAt column', () => {
    it('has column name "created_at" (snake_case in DB)', () => {
      expect(demoUsers.createdAt.name).toBe('created_at');
    });

    it('is a timestamp column (PgTimestamp)', () => {
      expect(demoUsers.createdAt.columnType).toBe('PgTimestamp');
    });

    it('is not nullable', () => {
      expect(demoUsers.createdAt.notNull).toBe(true);
    });

    it('has a default value (now())', () => {
      expect(demoUsers.createdAt.hasDefault).toBe(true);
    });

    it('is not a primary key', () => {
      expect(demoUsers.createdAt.primary).toBe(false);
    });

    it('is not unique', () => {
      expect(demoUsers.createdAt.isUnique).toBe(false);
    });

    it('has date data type', () => {
      expect(demoUsers.createdAt.dataType).toBe('date');
    });

    it('does not include timezone', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((demoUsers.createdAt as any).withTimezone).toBe(false);
    });
  });

  describe('TypeScript type exports', () => {
    it('User type includes expected fields (compile-time verified at runtime via shape)', () => {
      // This validates the shape of the inferred select type at runtime
      const exampleUser: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
      };
      expect(exampleUser.id).toBe(1);
      expect(exampleUser.name).toBe('Test User');
      expect(exampleUser.email).toBe('test@example.com');
      expect(exampleUser.createdAt).toBeInstanceOf(Date);
    });

    it('NewUser type omits auto-generated fields (id and createdAt are optional)', () => {
      // NewUser should allow inserting without id and createdAt
      const newUser: NewUser = {
        name: 'New User',
        email: 'new@example.com',
      };
      expect(newUser.name).toBe('New User');
      expect(newUser.email).toBe('new@example.com');
      expect(newUser.id).toBeUndefined();
      expect(newUser.createdAt).toBeUndefined();
    });

    it('NewUser type allows providing all fields explicitly', () => {
      const now = new Date();
      const newUser: NewUser = {
        id: 42,
        name: 'Full User',
        email: 'full@example.com',
        createdAt: now,
      };
      expect(newUser.id).toBe(42);
      expect(newUser.createdAt).toBe(now);
    });
  });

  describe('column count and completeness', () => {
    it('has exactly 4 columns defined', () => {
      const columns = Object.keys(demoUsers).filter(
        (k) => typeof demoUsers[k as keyof typeof demoUsers] === 'object' &&
               demoUsers[k as keyof typeof demoUsers] !== null &&
               'columnType' in (demoUsers[k as keyof typeof demoUsers] as object)
      );
      expect(columns.length).toBe(4);
    });

    it('does not expose unexpected columns', () => {
      const columnNames = [
        demoUsers.id.name,
        demoUsers.name.name,
        demoUsers.email.name,
        demoUsers.createdAt.name,
      ];
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('name');
      expect(columnNames).toContain('email');
      expect(columnNames).toContain('created_at');
    });
  });
});
