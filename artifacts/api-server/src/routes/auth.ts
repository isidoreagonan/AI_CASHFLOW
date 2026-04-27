import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, gt, and } from "drizzle-orm";
import { generateToken, hashPassword, comparePassword, authMiddleware } from "../lib/auth";
import { sendPasswordResetEmail } from "../lib/email";

const router = Router();

router.post("/register", async (req, res) => {
  const { email, password, name, firstName, lastName, phone } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: "Email, mot de passe et nom sont requis" });
    return;
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length) {
    res.status(400).json({ error: "Cet email est déjà utilisé" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash,
    name,
    firstName: firstName || null,
    lastName: lastName || null,
    phone: phone || null,
  }).returning();

  const token = generateToken(user.id);
  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      hasPaid: user.hasPaid,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!users.length) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const user = users[0];
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = generateToken(user.id);
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      hasPaid: user.hasPaid,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.json({ message: "Si cet email existe, un code a été envoyé." });
    return;
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

  if (users.length) {
    const user = users[0];
    const resetCode = String(Math.floor(100000 + Math.random() * 900000));
    const resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await db.update(usersTable).set({ resetCode, resetCodeExpiry }).where(eq(usersTable.id, user.id));

    try {
      await sendPasswordResetEmail({
        email: user.email,
        firstName: user.firstName || user.name,
        resetCode,
      });
    } catch (err) {
      console.error("[EMAIL] Échec envoi code reset:", err);
    }
  }

  res.json({ message: "Si cet email existe, un code de réinitialisation a été envoyé." });
});

router.post("/reset-password", async (req, res) => {
  const { email, code, password } = req.body;
  if (!email || !code || !password) {
    res.status(400).json({ error: "Email, code et mot de passe sont requis" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères" });
    return;
  }

  const now = new Date();
  const users = await db.select().from(usersTable).where(
    and(eq(usersTable.email, email), eq(usersTable.resetCode, code), gt(usersTable.resetCodeExpiry, now))
  ).limit(1);

  if (!users.length) {
    res.status(400).json({ error: "Code invalide ou expiré. Vérifiez votre email ou demandez un nouveau code." });
    return;
  }

  const user = users[0];
  const passwordHash = await hashPassword(password);

  const [updated] = await db.update(usersTable).set({
    passwordHash,
    resetCode: null,
    resetCodeExpiry: null,
  }).where(eq(usersTable.id, user.id)).returning();

  const token = generateToken(updated.id);
  res.json({
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone,
      role: updated.role,
      hasPaid: updated.hasPaid,
      createdAt: updated.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/setup-password", async (req, res) => {
  const { token, password, firstName, lastName, phone } = req.body;
  if (!token || !password || !firstName || !lastName) {
    res.status(400).json({ error: "Tous les champs sont requis" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Le mot de passe doit contenir au moins 8 caractères" });
    return;
  }

  const now = new Date();
  const users = await db.select().from(usersTable).where(
    and(eq(usersTable.setupToken, token), gt(usersTable.setupTokenExpiry, now))
  ).limit(1);

  if (!users.length) {
    res.status(400).json({ error: "Lien invalide ou expiré. Contactez l'administrateur." });
    return;
  }

  const user = users[0];
  const passwordHash = await hashPassword(password);
  const name = [firstName, lastName].filter(Boolean).join(" ");

  const [updated] = await db.update(usersTable).set({
    passwordHash,
    firstName,
    lastName,
    phone: phone || user.phone,
    name,
    setupToken: null,
    setupTokenExpiry: null,
  }).where(eq(usersTable.id, user.id)).returning();

  const jwtToken = generateToken(updated.id);
  res.json({
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone,
      role: updated.role,
      hasPaid: updated.hasPaid,
      createdAt: updated.createdAt.toISOString(),
    },
    token: jwtToken,
  });
});

router.post("/logout", (_req, res) => {
  res.json({ message: "Logged out successfully" });
});

router.get("/me", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    role: user.role,
    hasPaid: user.hasPaid,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
