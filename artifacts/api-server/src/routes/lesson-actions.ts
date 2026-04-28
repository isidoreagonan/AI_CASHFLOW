import { Router } from "express";
import { db } from "@workspace/db";
import { lessonsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, adminMiddleware } from "../lib/auth";
import { objectStorageService } from "../lib/objectStorage";

const router = Router();

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

router.get("/:lessonId", authMiddleware, async (req, res) => {
  const lessonId = parseInt(req.params["lessonId"] || "");
  if (isNaN(lessonId)) {
    res.status(400).json({ error: "Invalid lesson ID" });
    return;
  }

  const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId)).limit(1);
  if (!lessons.length) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  res.json(formatLesson(lessons[0]));
});

router.put("/:lessonId", adminMiddleware, async (req, res) => {
  const lessonId = parseInt(req.params["lessonId"] || "");
  if (isNaN(lessonId)) {
    res.status(400).json({ error: "Invalid lesson ID" });
    return;
  }

  const { title, description, videoUrl, videoType, duration, order, isFree } = req.body;
  
  // Si la vidéo a été remplacée, on supprime l'ancienne de Cloudflare R2 pour libérer de l'espace
  const [oldLesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId));
  if (oldLesson && oldLesson.videoType === "upload" && oldLesson.videoUrl !== videoUrl && oldLesson.videoUrl.includes("pub-")) {
    const objectPath = oldLesson.videoUrl.split("/").pop();
    if (objectPath) {
      objectStorageService.deleteObject(objectPath).catch(err => console.error("Failed to delete old video:", err));
    }
  }

  const [updated] = await db.update(lessonsTable)
    .set({ title, description, videoUrl, videoType, duration, order, isFree })
    .where(eq(lessonsTable.id, lessonId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Lesson not found" });
    return;
  }

  res.json(formatLesson(updated));
});

router.delete("/:lessonId", adminMiddleware, async (req, res) => {
  const lessonId = parseInt(req.params["lessonId"] || "");
  if (isNaN(lessonId)) {
    res.status(400).json({ error: "Invalid lesson ID" });
    return;
  }

  const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId));
  if (lesson && lesson.videoType === "upload" && lesson.videoUrl.includes("pub-")) {
    const objectPath = lesson.videoUrl.split("/").pop();
    if (objectPath) {
      objectStorageService.deleteObject(objectPath).catch(err => console.error("Failed to delete video:", err));
    }
  }

  await db.delete(lessonsTable).where(eq(lessonsTable.id, lessonId));
  res.json({ message: "Lesson deleted" });
});

export default router;
