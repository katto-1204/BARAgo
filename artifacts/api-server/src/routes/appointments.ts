import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, usersTable, residentsTable, appointmentsTable, notificationsTable } from "@workspace/db";
import { requireAuthMiddleware, requireAdminOrHealthWorker } from "../middlewares/auth";
import { CreateAppointmentBody, UpdateAppointmentBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function buildAppointmentWithResident(appointment: typeof appointmentsTable.$inferSelect) {
  const [resident] = await db
    .select()
    .from(residentsTable)
    .leftJoin(usersTable, eq(residentsTable.userId, usersTable.id))
    .where(eq(residentsTable.id, appointment.residentId));

  return {
    ...appointment,
    resident: resident ? { ...resident.residents, user: resident.users } : null,
  };
}

router.get("/appointments", requireAuthMiddleware, async (req, res): Promise<void> => {
  const { status, residentId } = req.query as { status?: string; residentId?: string };
  const sessionUser = req.session.user!;

  let query = db.select().from(appointmentsTable).$dynamic();

  const conditions = [];

  if (sessionUser.role === "resident") {
    if (sessionUser.residentId) {
      conditions.push(eq(appointmentsTable.residentId, sessionUser.residentId));
    }
  } else if (residentId) {
    conditions.push(eq(appointmentsTable.residentId, residentId));
  }

  if (status) {
    conditions.push(eq(appointmentsTable.status, status));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const appointments = await query.orderBy(appointmentsTable.createdAt);

  const result = await Promise.all(appointments.map(buildAppointmentWithResident));
  res.json(result);
});

router.post("/appointments", requireAuthMiddleware, async (req, res): Promise<void> => {
  const sessionUser = req.session.user!;
  if (!sessionUser.residentId) {
    res.status(400).json({ error: "No resident profile found" });
    return;
  }

  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [appointment] = await db.insert(appointmentsTable).values({
    residentId: sessionUser.residentId,
    patientName: parsed.data.patientName,
    patientAge: parsed.data.patientAge ?? null,
    reason: parsed.data.reason,
    preferredDate: parsed.data.preferredDate ?? null,
    preferredTime: parsed.data.preferredTime ?? null,
    status: "pending",
  }).returning();

  const result = await buildAppointmentWithResident(appointment);
  res.status(201).json(result);
});

router.get("/appointments/:id", requireAuthMiddleware, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [appointment] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, id));
  if (!appointment) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const result = await buildAppointmentWithResident(appointment);
  res.json(result);
});

router.patch("/appointments/:id", requireAdminOrHealthWorker, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = UpdateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(appointmentsTable).where(eq(appointmentsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  const [updated] = await db
    .update(appointmentsTable)
    .set(parsed.data)
    .where(eq(appointmentsTable.id, id))
    .returning();

  // Send notification to resident
  const [resident] = await db.select().from(residentsTable).where(eq(residentsTable.id, existing.residentId));
  if (resident && parsed.data.status) {
    const statusMessages: Record<string, { title: string; message: string }> = {
      approved: { title: "Appointment Approved", message: `Your checkup appointment for ${existing.patientName} has been approved.` },
      rejected: { title: "Appointment Rejected", message: `Your appointment request was rejected. ${parsed.data.adminRemarks ?? ""}` },
      rescheduled: { title: "Appointment Rescheduled", message: `Your appointment has been rescheduled to ${parsed.data.preferredDate ?? "a new date"}.` },
      completed: { title: "Checkup Completed", message: `Your checkup appointment for ${existing.patientName} has been marked as completed.` },
    };
    const notif = statusMessages[parsed.data.status];
    if (notif) {
      await db.insert(notificationsTable).values({
        userId: resident.userId,
        title: notif.title,
        message: notif.message,
        type: "appointment",
        isRead: false,
      });
    }
  }

  const result = await buildAppointmentWithResident(updated);
  res.json(result);
});

router.delete("/appointments/:id", requireAuthMiddleware, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [updated] = await db
    .update(appointmentsTable)
    .set({ status: "cancelled" })
    .where(eq(appointmentsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Appointment not found" });
    return;
  }

  res.json({ success: true });
});

export default router;
