import { integer, pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm/relations';

const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const departments = pgTable('departments', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 50 }).notNull(),
  description: varchar('description', { length: 255 }),
  ...timestamps,
});

export const subjects = pgTable('subjects', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  departmentId: integer('department_id')
    .notNull()
    .references(() => departments.id, { onDelete: 'restrict' }),
  name: varchar('name', { length: 50 }).notNull(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  ...timestamps,
});

// RELATIONS

export const departmentsRelations = relations(departments, ({ many }) => ({
  subjects: many(subjects),
}));

export const subjectsRelations = relations(subjects, ({ one }) => ({
  department: one(departments, {
    fields: [subjects.departmentId],
    references: [departments.id],
  }),
}));

// TYPES

export type TDepartment = typeof departments.$inferSelect;
export type TNewDepartment = typeof departments.$inferInsert;

export type TSubject = typeof subjects.$inferSelect;
export type TNewSubject = typeof subjects.$inferInsert;
