import { Router } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { coursesTable, modulesTable, lessonsTable, usersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { authMiddleware, adminMiddleware, hashPassword, generateToken } from "../lib/auth";
import { sendInvitationEmail, sendAccessGrantedEmail } from "../lib/email";

const router = Router();

function formatCourse(c: any) {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    thumbnail: c.thumbnail,
    price: parseFloat(c.price),
    isPublished: c.isPublished,
    createdAt: c.createdAt.toISOString(),
  };
}

router.get("/", async (_req, res) => {
  const courses = await db.select().from(coursesTable).orderBy(asc(coursesTable.id));
  res.json(courses.map(formatCourse));
});

router.post("/", adminMiddleware, async (req, res) => {
  const { title, description, thumbnail, price, isPublished } = req.body;
  if (!title || !description) {
    res.status(400).json({ error: "Title and description are required" });
    return;
  }

  const [course] = await db.insert(coursesTable).values({
    title,
    description,
    thumbnail: thumbnail || "",
    price: price?.toString() || "0",
    isPublished: isPublished || false,
  }).returning();

  res.status(201).json(formatCourse(course));
});

router.get("/:courseId", authMiddleware, async (req, res) => {
  const courseId = parseInt(req.params["courseId"] || "");
  if (isNaN(courseId)) {
    res.status(400).json({ error: "Invalid course ID" });
    return;
  }

  const courses = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
  if (!courses.length) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  const modules = await db.select().from(modulesTable)
    .where(eq(modulesTable.courseId, courseId))
    .orderBy(asc(modulesTable.order));

  const modulesWithLessons = await Promise.all(
    modules.map(async (mod) => {
      const lessons = await db.select().from(lessonsTable)
        .where(eq(lessonsTable.moduleId, mod.id))
        .orderBy(asc(lessonsTable.order));
      return {
        id: mod.id,
        courseId: mod.courseId,
        title: mod.title,
        description: mod.description,
        order: mod.order,
        createdAt: mod.createdAt.toISOString(),
        lessons: lessons.map((l) => ({
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
        })),
      };
    })
  );

  res.json({
    ...formatCourse(courses[0]),
    modules: modulesWithLessons,
  });
});

router.put("/:courseId", adminMiddleware, async (req, res) => {
  const courseId = parseInt(req.params["courseId"] || "");
  if (isNaN(courseId)) {
    res.status(400).json({ error: "Invalid course ID" });
    return;
  }

  const { title, description, thumbnail, price, isPublished } = req.body;
  const [updated] = await db.update(coursesTable)
    .set({ title, description, thumbnail, price: price?.toString(), isPublished })
    .where(eq(coursesTable.id, courseId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Course not found" });
    return;
  }

  res.json(formatCourse(updated));
});

router.delete("/:courseId", adminMiddleware, async (req, res) => {
  const courseId = parseInt(req.params["courseId"] || "");
  if (isNaN(courseId)) {
    res.status(400).json({ error: "Invalid course ID" });
    return;
  }

  await db.delete(coursesTable).where(eq(coursesTable.id, courseId));
  res.json({ message: "Course deleted" });
});

router.post("/:courseId/grant-access", adminMiddleware, async (req, res) => {
  const courseId = parseInt(req.params["courseId"] || "");
  if (isNaN(courseId)) {
    res.status(400).json({ error: "ID de formation invalide" });
    return;
  }

  const { email, firstName, lastName } = req.body;
  if (!email) {
    res.status(400).json({ error: "L'email est requis" });
    return;
  }

  const courses = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
  if (!courses.length) {
    res.status(404).json({ error: "Formation introuvable" });
    return;
  }
  const course = courses[0];

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

  if (existing.length) {
    const user = existing[0];
    await db.update(usersTable).set({ hasPaid: true }).where(eq(usersTable.id, user.id));
    try {
      await sendAccessGrantedEmail({
        email: user.email,
        firstName: user.firstName || user.name,
        courseTitle: course.title,
      });
    } catch (err) {
      console.error("[EMAIL] Échec envoi email accès accordé:", err);
    }
    res.json({ message: `Accès accordé à ${email}. Un email de notification lui a été envoyé.` });
    return;
  }

  const setupToken = crypto.randomBytes(32).toString("hex");
  const setupTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const tempPasswordHash = await hashPassword(crypto.randomBytes(16).toString("hex"));
  const resolvedFirstName = firstName || email.split("@")[0];
  const resolvedLastName = lastName || "";
  const name = [resolvedFirstName, resolvedLastName].filter(Boolean).join(" ");

  await db.insert(usersTable).values({
    email,
    passwordHash: tempPasswordHash,
    name,
    firstName: resolvedFirstName,
    lastName: resolvedLastName || null,
    phone: null,
    role: "student",
    hasPaid: true,
    setupToken,
    setupTokenExpiry,
  });

  try {
    await sendInvitationEmail({
      email,
      firstName: resolvedFirstName,
      setupToken,
      courseTitle: course.title,
    });
  } catch (err) {
    console.error("[EMAIL] Échec envoi invitation:", err);
  }

  res.json({ message: `Compte créé pour ${email}. Un email d'invitation lui a été envoyé pour configurer son mot de passe.` });
});

export default router;
