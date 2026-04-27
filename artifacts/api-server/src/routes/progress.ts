import { Router } from "express";
import { db } from "@workspace/db";
import { progressTable, lessonsTable, modulesTable, coursesTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware, adminMiddleware } from "../lib/auth";

const router = Router();

router.get("/", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const progress = await db.select().from(progressTable)
    .where(eq(progressTable.userId, user.id));

  res.json(progress.map((p) => ({
    id: p.id,
    userId: p.userId,
    lessonId: p.lessonId,
    completed: p.completed,
    completedAt: p.completedAt.toISOString(),
  })));
});

router.post("/", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const { lessonId, completed } = req.body;

  if (!lessonId) {
    res.status(400).json({ error: "lessonId is required" });
    return;
  }

  const existing = await db.select().from(progressTable)
    .where(and(eq(progressTable.userId, user.id), eq(progressTable.lessonId, lessonId)))
    .limit(1);

  let record;
  if (existing.length) {
    const [updated] = await db.update(progressTable)
      .set({ completed, completedAt: new Date() })
      .where(and(eq(progressTable.userId, user.id), eq(progressTable.lessonId, lessonId)))
      .returning();
    record = updated;
  } else {
    const [inserted] = await db.insert(progressTable)
      .values({ userId: user.id, lessonId, completed, completedAt: new Date() })
      .returning();
    record = inserted;
  }

  res.json({
    id: record.id,
    userId: record.userId,
    lessonId: record.lessonId,
    completed: record.completed,
    completedAt: record.completedAt.toISOString(),
  });
});

// Admin: get progress for a specific user with full lesson/module/course details
router.get("/admin/user/:userId", adminMiddleware, async (req, res) => {
  const userId = parseInt(req.params["userId"] || "");
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const rows = await db
    .select({
      progressId: progressTable.id,
      completed: progressTable.completed,
      completedAt: progressTable.completedAt,
      lessonId: lessonsTable.id,
      lessonTitle: lessonsTable.title,
      lessonOrder: lessonsTable.order,
      moduleId: modulesTable.id,
      moduleTitle: modulesTable.title,
      moduleOrder: modulesTable.order,
      courseId: coursesTable.id,
      courseTitle: coursesTable.title,
    })
    .from(progressTable)
    .innerJoin(lessonsTable, eq(progressTable.lessonId, lessonsTable.id))
    .innerJoin(modulesTable, eq(lessonsTable.moduleId, modulesTable.id))
    .innerJoin(coursesTable, eq(modulesTable.courseId, coursesTable.id))
    .where(eq(progressTable.userId, userId));

  res.json(rows.map(r => ({
    progressId: r.progressId,
    completed: r.completed,
    completedAt: r.completedAt?.toISOString(),
    lesson: { id: r.lessonId, title: r.lessonTitle, order: r.lessonOrder },
    module: { id: r.moduleId, title: r.moduleTitle, order: r.moduleOrder },
    course: { id: r.courseId, title: r.courseTitle },
  })));
});

// Admin: get all users progress summary
router.get("/admin/summary", adminMiddleware, async (_req, res) => {
  const rows = await db
    .select({
      userId: progressTable.userId,
      userName: usersTable.name,
      userEmail: usersTable.email,
      lessonId: progressTable.lessonId,
      completed: progressTable.completed,
      completedAt: progressTable.completedAt,
      moduleId: modulesTable.id,
      moduleTitle: modulesTable.title,
      courseTitle: coursesTable.title,
    })
    .from(progressTable)
    .innerJoin(usersTable, eq(progressTable.userId, usersTable.id))
    .innerJoin(lessonsTable, eq(progressTable.lessonId, lessonsTable.id))
    .innerJoin(modulesTable, eq(lessonsTable.moduleId, modulesTable.id))
    .innerJoin(coursesTable, eq(modulesTable.courseId, coursesTable.id));

  // Group by user
  const byUser: Record<number, any> = {};
  for (const r of rows) {
    if (!byUser[r.userId]) {
      byUser[r.userId] = {
        userId: r.userId,
        name: r.userName,
        email: r.userEmail,
        lessonsCompleted: 0,
        lessonsInProgress: 0,
        lastActivity: null as string | null,
        currentModule: null as string | null,
        currentCourse: null as string | null,
      };
    }
    const u = byUser[r.userId];
    if (r.completed) u.lessonsCompleted++;
    else u.lessonsInProgress++;
    const at = r.completedAt?.toISOString();
    if (!u.lastActivity || (at && at > u.lastActivity)) {
      u.lastActivity = at;
      u.currentModule = r.moduleTitle;
      u.currentCourse = r.courseTitle;
    }
  }

  res.json(Object.values(byUser));
});

export default router;
