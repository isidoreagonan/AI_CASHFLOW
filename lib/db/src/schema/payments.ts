import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  depositId: text("deposit_id").unique(), // UUID PawaPay
  tokenPay: text("token_pay").unique(),   // legacy MoneyFusion (kept for migration)
  amount: integer("amount").notNull().default(10000),
  currency: text("currency").notNull().default("XOF"),
  correspondent: text("correspondent"),   // e.g. MTN_MOMO_BEN
  country: text("country"),              // e.g. BEN
  phone: text("phone"),                  // payer phone
  status: text("status", { enum: ["pending", "paid", "failed", "ACCEPTED", "COMPLETED", "FAILED", "SUBMITTED"] }).notNull().default("pending"),
  nomClient: text("nom_client"),
  numeroTransaction: text("numero_transaction"),
  moyenPaiement: text("moyen_paiement"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Payment = typeof paymentsTable.$inferSelect;
