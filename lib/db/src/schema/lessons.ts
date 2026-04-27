import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { modulesTable } from "./modules";

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modulesTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  videoUrl: text("video_url").notNull().default(""),
  videoType: text("video_type", { enum: ["youtube", "vimeo", "upload", "audio", "embed"] }).notNull().default("youtube"),
  duration: integer("duration").notNull().default(0),
  order: integer("order").notNull().default(0),
  isFree: boolean("is_free").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLessonSchema = createInsertSchema(lessonsTable).omit({ id: true, createdAt: true });
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessonsTable.$inferSelect;
