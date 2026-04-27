import { Router } from "express";
import { db } from "@workspace/db";
import { lessonsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { authMiddleware, adminMiddleware } from "../lib/auth";

const router = Router({ mergeParams: true });

function formatLesson(l: any) {
  return {
    id: l.id,
    moduleId: l.moduleId,
    title: l.title,
    description: l.description,
    videoUrl: l.videoUrl,
    videoType: l.videoType,
    duration: l.duration,
    order: l.order,
    isFree: l.isFree,
    createdAt: l.createdAt.toISOString(),
  };
}

router.get("/", authMiddleware, async (req, res) => {
  const moduleId = parseInt(req.params["moduleId"] || "");
  if (isNaN(moduleId)) {
    res.status(400).json({ error: "Invalid module ID" });
    return;
  }

  const lessons = await db.select().from(lessonsTable)
    .where(eq(lessonsTable.moduleId, moduleId))
    .orderBy(asc(lessonsTable.order));

  res.json(lessons.map(formatLesson));
});

router.post("/", adminMiddleware, async (req, res) => {
  const moduleId = parseInt(req.params["moduleId"] || "");
  if (isNaN(moduleId)) {
    res.status(400).json({ error: "Invalid module ID" });
    return;
  }

  const { title, description, videoUrl, videoType, duration, order, isFree } = req.body;
  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  const [lesson] = await db.insert(lessonsTable).values({
    moduleId,
    title,
    description: description || "",
    videoUrl: videoUrl || "",
    videoType: videoType || "youtube",
    duration: duration || 0,
    order: order || 0,
    isFree: isFree || false,
  }).returning();

  res.status(201).json(formatLesson(lesson));
});

export default router;
