import { Router } from "express";
import { randomUUID } from "crypto";
import { db, paymentsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../lib/auth";

const router = Router();

const PAWAPAY_TOKEN = process.env.PAWAPAY_API_TOKEN || "";
const PAWAPAY_BASE = process.env.PAWAPAY_API_URL || "https://api.pawapay.io";
const AMOUNT = 10000;

// Map of supported countries (XOF/XAF = FCFA regions)
const COUNTRY_CURRENCY: Record<string, string> = {
  BEN: "XOF", CIV: "XOF", SEN: "XOF", // West Africa FCFA
  CMR: "XAF", COG: "XAF", GAB: "XAF", // Central Africa FCFA
  COD: "CDF", KEN: "KES", RWA: "RWF",
  UGA: "UGX", ZMB: "ZMW", SLE: "SLE",
};

// Amount per currency (10,000 FCFA equivalent)
const CURRENCY_AMOUNT: Record<string, string> = {
  XOF: "10000", XAF: "10000",
  CDF: "28000", KES: "600",
  RWF: "12000", UGX: "37000",
  ZMW: "270", SLE: "230",
};

// Predict correspondent (network) from phone number
router.post("/predict", async (req, res) => {
  const { msisdn } = req.body;
  if (!msisdn) { res.status(400).json({ error: "msisdn required" }); return; }

  try {
    const response = await fetch(`${PAWAPAY_BASE}/v1/predict-correspondent`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAWAPAY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ msisdn }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Prédiction impossible" });
  }
});

// Initiate a PawaPay deposit
router.post("/initiate", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  const { phone, correspondent, country } = req.body;

  if (!phone || !correspondent || !country) {
    res.status(400).json({ error: "phone, correspondent et country requis" });
    return;
  }

  const currency = COUNTRY_CURRENCY[country] || "XOF";
  const amount = CURRENCY_AMOUNT[currency] || "10000";
  const depositId = randomUUID();

  const payload: any = {
    depositId,
    amount,
    currency,
    correspondent,
    payer: {
      type: "MSISDN",
      address: { value: phone },
    },
    customerTimestamp: new Date().toISOString(),
    statementDescription: "IA CASH FLOW",
    country,
    metadata: [
      { fieldName: "userId", fieldValue: String(user.id) },
      { fieldName: "userEmail", fieldValue: user.email, isPII: true },
    ],
  };

  try {
    const response = await fetch(`${PAWAPAY_BASE}/v1/deposits`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PAWAPAY_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let data;
    try {
      data = await response.json();
    } catch (e) {
      const text = await response.text();
      console.error("PawaPay API returned non-JSON response:", text);
      res.status(500).json({ error: "Erreur de communication avec PawaPay" });
      return;
    }

    if (!response.ok || (data.status !== "ACCEPTED" && data.status !== "DUPLICATE_IGNORED")) {
      console.error(`PawaPay deposit error HTTP ${response.status}:`, JSON.stringify(data));
      res.status(400).json({
        error: data.rejectionReason?.rejectionMessage || data.errorMessage || data.message || "Paiement rejeté par l'opérateur",
        details: data,
      });
      return;
    }

    // Save to DB
    await db.insert(paymentsTable).values({
      userId: user.id,
      depositId,
      amount: parseInt(amount),
      currency,
      correspondent,
      country,
      phone,
      status: "ACCEPTED",
      nomClient: user.name,
    }).onConflictDoNothing();

    res.json({
      depositId,
      status: data.status,
      message: "Vérifiez votre téléphone et confirmez le paiement avec votre PIN",
    });
  } catch (err: any) {
    console.error("PawaPay initiate error:", err);
    res.status(500).json({ error: "Erreur lors de l'initiation du paiement" });
  }
});

// Check deposit status
router.get("/status/:depositId", authMiddleware, async (req, res) => {
  const { depositId } = req.params;
  const user = (req as any).user;

  try {
    const response = await fetch(`${PAWAPAY_BASE}/v1/deposits/${depositId}`, {
      headers: { "Authorization": `Bearer ${PAWAPAY_TOKEN}` },
    });

    const data = await response.json() as any[];

    if (!Array.isArray(data) || data.length === 0) {
      res.status(404).json({ error: "Dépôt introuvable" });
      return;
    }

    const deposit = data[0];
    const status = deposit.status as string;

    // Update local DB
    await db.update(paymentsTable)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(paymentsTable.depositId, depositId));

    // If COMPLETED → activate user access
    if (status === "COMPLETED") {
      await db.update(usersTable)
        .set({ hasPaid: true })
        .where(eq(usersTable.id, user.id));
    }

    res.json({
      depositId,
      status,
      paid: status === "COMPLETED",
      correspondent: deposit.correspondent,
      amount: deposit.amount,
      currency: deposit.currency,
      failureReason: deposit.failureReason,
    });
  } catch (err: any) {
    console.error("PawaPay status error:", err);
    res.status(500).json({ error: "Impossible de vérifier le statut" });
  }
});

// PawaPay Webhook (callback when deposit completes/fails)
router.post("/webhook", async (req, res) => {
  const payload = req.body;
  console.log("PawaPay webhook:", JSON.stringify(payload));

  try {
    const depositId = payload.depositId;
    const status = payload.status;

    if (!depositId) { res.sendStatus(200); return; }

    const payments = await db.select().from(paymentsTable)
      .where(eq(paymentsTable.depositId, depositId)).limit(1);

    if (!payments.length) { res.sendStatus(200); return; }

    const payment = payments[0];

    await db.update(paymentsTable)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(paymentsTable.depositId, depositId));

    if (status === "COMPLETED" && payment.userId) {
      await db.update(usersTable)
        .set({ hasPaid: true })
        .where(eq(usersTable.id, payment.userId));
      console.log(`✅ PawaPay: paiement validé pour userId=${payment.userId}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.sendStatus(200);
  }
});

// Payment history — admin gets all payments, user gets own
router.get("/history", authMiddleware, async (req, res) => {
  const user = (req as any).user;
  if (user.role === "admin") {
    const payments = await db
      .select({
        id: paymentsTable.id,
        depositId: paymentsTable.depositId,
        status: paymentsTable.status,
        amount: paymentsTable.amount,
        currency: paymentsTable.currency,
        country: paymentsTable.country,
        correspondent: paymentsTable.correspondent,
        phone: paymentsTable.phone,
        failureReason: paymentsTable.failureReason,
        createdAt: paymentsTable.createdAt,
        user: {
          name: usersTable.name,
          email: usersTable.email,
        },
      })
      .from(paymentsTable)
      .leftJoin(usersTable, eq(paymentsTable.userId, usersTable.id))
      .orderBy(paymentsTable.createdAt);
    res.json(payments);
  } else {
    const payments = await db.select().from(paymentsTable)
      .where(eq(paymentsTable.userId, user.id));
    res.json(payments);
  }
});

export default router;
