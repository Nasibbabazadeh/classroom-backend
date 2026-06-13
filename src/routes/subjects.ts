import express from 'express';
import { and, desc, eq, getTableColumns, ilike, or, sql } from 'drizzle-orm';
import { departments, subjects } from '../db/schema';
import { db } from '../db';
const subjectRouter = express.Router();

const route = (path: string) => subjectRouter.route(path);

route('/').get(async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query; // req : https://development/api/v1/subjects?search=Salam&department=GAN&page=3&limit=30
    const currentPage = Math.max(1, +page);
    const limitPerPage = Math.max(1, +limit);
    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions = [];

    if (search) {
      filterConditions.push(
        or(ilike(subjects.name, `%${search}%`), ilike(subjects.code, `%${search}%`)), // or(...) means match if the term appears in the NAME or the CODE
      );
    }

    if (department) {
      filterConditions.push(ilike(departments.name, `%${department}%`)); // ilike => case-insensitive; like => case-sensitive
    }

    const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined; // WHERE Department = 'Sales' AND Subject = 'TEST';
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id)) // eq(equals)
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;
    const subjectsList = await db
      .select({
        ...getTableColumns(subjects),
        department: { ...getTableColumns(departments) },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).send({
      status: 'success',
      data: subjectsList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (e) {
    console.error(`GET /subjects error: ${e}`);
    res.status(500).send({ error: 'Failed to get subjects' });
  }
});

export default subjectRouter;
