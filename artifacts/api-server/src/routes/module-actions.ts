import { Router } from "express";
import { db } from "@workspace/db";
import { modulesTable, coursesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { adminMiddleware } from "../lib/auth";

const router = Router();

// List ALL modules across all courses (admin only) — used by admin resource upload form
router.get("/", adminMiddleware, async (_req, res) => {
  const rows = await db
    .select({
      id: modulesTable.id,
      courseId: modulesTable.courseId,
      title: modulesTable.title,
      description: modulesTable.description,
      order: modulesTable.order,
      createdAt: modulesTable.createdAt,
      courseTitle: coursesTable.title,
    })
    .from(modulesTable)
    .innerJoin(coursesTable, eq(modulesTable.courseId, coursesTable.id))
    .orderBy(asc(coursesTable.id), asc(modulesTable.order));

  res.json(
    rows.map((r) => ({
      id: r.id,
      courseId: r.courseId,
      courseTitle: r.courseTitle,
      title: r.title,
      description: r.description,
      order: r.order,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.put("/:moduleId", adminMiddleware, async (req, res) => {
  const moduleId = parseInt(req.params["moduleId"] || "");
  if (isNaN(moduleId)) {
    res.status(400).json({ error: "Invalid module ID" });
    return;
  }

  const { title, description, order } = req.body;
  const [updated] = await db.update(modulesTable)
    .set({ title, description, order })
    .where(eq(modulesTable.id, moduleId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Module not found" });
    return;
  }

  res.json({
    id: updated.id,
    courseId: updated.courseId,
    title: updated.title,
    description: updated.description,
    order: updated.order,
    createdAt: updated.createdAt.toISOString(),
  });
});

router.delete("/:moduleId", adminMiddleware, async (req, res) => {
  const moduleId = parseInt(req.params["moduleId"] || "");
  if (isNaN(moduleId)) {
    res.status(400).json({ error: "Invalid module ID" });
    return;
  }

  await db.delete(modulesTable).where(eq(modulesTable.id, moduleId));
  res.json({ message: "Module deleted" });
});

export default router;
