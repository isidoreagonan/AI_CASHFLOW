import { Router } from "express";
import { db } from "@workspace/db";
import { filesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { authMiddleware, adminMiddleware } from "../lib/auth";
import { objectStorageService } from "../lib/objectStorage";

const router = Router();

function formatFile(f: any) {
  return {
    id: f.id,
    moduleId: f.moduleId,
    name: f.name,
    description: f.description,
    fileUrl: f.fileUrl,
    fileType: f.fileType,
    fileSize: f.fileSize,
    createdAt: f.createdAt.toISOString(),
  };
}

router.get("/", authMiddleware, async (req, res) => {
  const moduleId = req.query["moduleId"] ? parseInt(req.query["moduleId"] as string) : null;

  let query = db.select().from(filesTable).orderBy(asc(filesTable.id));
  if (moduleId && !isNaN(moduleId)) {
    const files = await db.select().from(filesTable)
      .where(eq(filesTable.moduleId, moduleId))
      .orderBy(asc(filesTable.id));
    res.json(files.map(formatFile));
    return;
  }

  const files = await query;
  res.json(files.map(formatFile));
});

router.post("/", adminMiddleware, async (req, res) => {
  const { moduleId, name, description, fileUrl, fileType, fileSize } = req.body;
  if (!moduleId || !name || !fileUrl) {
    res.status(400).json({ error: "moduleId, name, and fileUrl are required" });
    return;
  }

  const [file] = await db.insert(filesTable).values({
    moduleId,
    name,
    description: description || "",
    fileUrl,
    fileType: fileType || "pdf",
    fileSize: fileSize || "",
  }).returning();

  res.status(201).json(formatFile(file));
});

router.delete("/:fileId", adminMiddleware, async (req, res) => {
  const fileId = parseInt(req.params["fileId"] || "");
  if (isNaN(fileId)) {
    res.status(400).json({ error: "Invalid file ID" });
    return;
  }

  const [file] = await db.select().from(filesTable).where(eq(filesTable.id, fileId));
  if (file && file.fileUrl.includes("pub-")) {
    const objectPath = file.fileUrl.split("/").pop();
    if (objectPath) {
      objectStorageService.deleteObject(objectPath).catch(err => console.error("Failed to delete file:", err));
    }
  }

  await db.delete(filesTable).where(eq(filesTable.id, fileId));
  res.json({ message: "File deleted" });
});

export default router;
