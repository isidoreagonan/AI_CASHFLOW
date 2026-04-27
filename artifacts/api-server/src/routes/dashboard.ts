import { Router } from "express";
import { db } from "@workspace/db";
import { coursesTable, lessonsTable, modulesTable, progressTable, usersTable, filesTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import { authMiddleware, adminMiddleware } from "../lib/auth";

const router = Router();

router.get("/summary", authMiddleware, async (req, res) => {
  const user = (req as any).user;

  const [courseCount] = await db.select({ value: count() }).from(coursesTable);
  const [lessonCount] = await db.select({ value: count() }).from(lessonsTable);

  const completedProgress = await db.select().from(progressTable)
    .where(eq(progressTable.userId, user.id));

  const completedCount = completedProgress.filter((p) => p.completed).length;
  const totalLessons = lessonCount?.value || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / Number(totalLessons)) * 100) : 0;

  const courses = await db.select().from(coursesTable)
    .where(eq(coursesTable.isPublished, true));

  res.json({
    totalCourses: Number(courseCount?.value || 0),
    totalLessons: Number(totalLessons),
    completedLessons: completedCount,
    progressPercent,
    enrolledCourses: courses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      thumbnail: c.thumbnail,
      price: parseFloat(c.price),
      isPublished: c.isPublished,
      createdAt: c.createdAt.toISOString(),
    })),
  });
});

router.get("/admin", adminMiddleware, async (_req, res) => {
  const [userCount] = await db.select({ value: count() }).from(usersTable);
  const [courseCount] = await db.select({ value: count() }).from(coursesTable);
  const [lessonCount] = await db.select({ value: count() }).from(lessonsTable);
  const [fileCount] = await db.select({ value: count() }).from(filesTable);

  const allUsers = await db.select().from(usersTable);
  const paidCount = allUsers.filter((u) => u.hasPaid).length;

  const recentUsers = await db.select().from(usersTable)
    .orderBy(desc(usersTable.createdAt))
    .limit(5);

  res.json({
    totalUsers: Number(userCount?.value || 0),
    totalCourses: Number(courseCount?.value || 0),
    totalLessons: Number(lessonCount?.value || 0),
    totalFiles: Number(fileCount?.value || 0),
    paidUsers: paidCount,
    recentUsers: recentUsers.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      hasPaid: u.hasPaid,
      createdAt: u.createdAt.toISOString(),
    })),
  });
});

export default router;
