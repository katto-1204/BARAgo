import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { residentsTable } from "./residents";

export const ambulanceRequestsTable = pgTable("ambulance_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  residentId: uuid("resident_id").references(() => residentsTable.id, { onDelete: "cascade" }).notNull(),
  patientName: text("patient_name").notNull(),
  exactLocation: text("exact_location").notNull(),
  contactNumber: text("contact_number").notNull(),
  emergencyType: text("emergency_type").notNull(),
  description: text("description"),
  urgencyLevel: text("urgency_level").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  adminRemarks: text("admin_remarks"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAmbulanceRequestSchema = createInsertSchema(ambulanceRequestsTable).omit({ id: true, requestedAt: true, updatedAt: true });
export type InsertAmbulanceRequest = z.infer<typeof insertAmbulanceRequestSchema>;
export type AmbulanceRequest = typeof ambulanceRequestsTable.$inferSelect;
