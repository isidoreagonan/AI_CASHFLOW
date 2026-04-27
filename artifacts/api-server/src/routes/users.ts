import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { adminMiddleware } from "../lib/auth";

const router = Router();

function formatUser(u: any) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    role: u.role,
    hasPaid: u.hasPaid,
    createdAt: u.createdAt.toISOString(),
  };
}

router.get("/", adminMiddleware, async (_req, res) => {
  const users = await db.select().from(usersTable);
  res.json(users.map(formatUser));
});

router.put("/:userId", adminMiddleware, async (req, res) => {
  const userId = parseInt(req.params["userId"] || "");
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  const { role, hasPaid } = req.body;
  const updateData: any = {};
  if (role !== undefined) updateData.role = role;
  if (hasPaid !== undefined) updateData.hasPaid = hasPaid;

  const [updated] = await db.update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, userId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(formatUser(updated));
});

router.delete("/:userId", adminMiddleware, async (req, res) => {
  const userId = parseInt(req.params["userId"] || "");
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid user ID" });
    return;
  }

  await db.delete(usersTable).where(eq(usersTable.id, userId));
  res.json({ message: "User deleted" });
});

export default router;
