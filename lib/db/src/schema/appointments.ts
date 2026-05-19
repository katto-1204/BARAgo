import { pgTable, text, uuid, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { residentsTable } from "./residents";
import { healthSchedulesTable } from "./health_schedules";

export const appointmentsTable = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  residentId: uuid("resident_id").references(() => residentsTable.id, { onDelete: "cascade" }).notNull(),
  scheduleId: uuid("schedule_id").references(() => healthSchedulesTable.id, { onDelete: "set null" }),
  patientName: text("patient_name").notNull(),
  patientAge: integer("patient_age"),
  reason: text("reason").notNull(),
  preferredDate: date("preferred_date"),
  preferredTime: text("preferred_time"),
  status: text("status").notNull().default("pending"),
  adminRemarks: text("admin_remarks"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAppointmentSchema = createInsertSchema(appointmentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointmentsTable.$inferSelect;
