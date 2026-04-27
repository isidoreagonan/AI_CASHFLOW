import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { modulesTable } from "./modules";

export const filesTable = pgTable("files", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modulesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type", { enum: ["pdf", "guide", "resource", "video", "other"] }).notNull().default("pdf"),
  fileSize: text("file_size").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFileSchema = createInsertSchema(filesTable).omit({ id: true, createdAt: true });
export type InsertFile = z.infer<typeof insertFileSchema>;
export type CourseFile = typeof filesTable.$inferSelect;
