import { Router } from "express";
import { db } from "@workspace/db";
import { modulesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { authMiddleware, adminMiddleware } from "../lib/auth";

const router = Router({ mergeParams: true });

function formatModule(m: any) {
  return {
    id: m.id,
    courseId: m.courseId,
    title: m.title,
    description: m.description,
    order: m.order,
    createdAt: m.createdAt.toISOString(),
  };
}

router.get("/", authMiddleware, async (req, res) => {
  const courseId = parseInt(req.params["courseId"] || "");
  if (isNaN(courseId)) {
    res.status(400).json({ error: "Invalid course ID" });
    return;
  }

  const modules = await db.select().from(modulesTable)
    .where(eq(modulesTable.courseId, courseId))
    .orderBy(asc(modulesTable.order));

  res.json(modules.map(formatModule));
});

router.post("/", adminMiddleware, async (req, res) => {
  const courseId = parseInt(req.params["courseId"] || "");
  if (isNaN(courseId)) {
    res.status(400).json({ error: "Invalid course ID" });
    return;
  }

  const { title, description, order } = req.body;
  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  const [mod] = await db.insert(modulesTable).values({
    courseId,
    title,
    description: description || "",
    order: order || 0,
  }).returning();

  res.status(201).json(formatModule(mod));
});

export default router;
