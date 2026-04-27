import { Router } from "express";
import { db } from "@workspace/db";
import { leadsTable } from "@workspace/db";

const router = Router();

router.post("/", async (req, res) => {
  const { email, name, phone } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  await db.insert(leadsTable).values({
    email,
    name: name || "",
    phone: phone || "",
  });

  res.status(201).json({ message: "Thank you! We'll be in touch soon." });
});

export default router;
