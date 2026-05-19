import { pgTable, text, uuid, timestamp, integer, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const healthSchedulesTable = pgTable("health_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  scheduleDate: date("schedule_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  slotLimit: integer("slot_limit").notNull(),
  currentSlots: integer("current_slots").notNull().default(0),
  assignedStaff: text("assigned_staff"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertHealthScheduleSchema = createInsertSchema(healthSchedulesTable).omit({ id: true, createdAt: true, currentSlots: true });
export type InsertHealthSchedule = z.infer<typeof insertHealthScheduleSchema>;
export type HealthSchedule = typeof healthSchedulesTable.$inferSelect;
