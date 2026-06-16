import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  try {
    // Cette requête simple permet de garder la base de données Supabase active (évite la pause après 7 jours)
    await db.execute(sql`SELECT 1`);
    const data = HealthCheckResponse.parse({ status: "ok" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ status: "error", message: "Database connection failed" });
  }
});

export default router;
