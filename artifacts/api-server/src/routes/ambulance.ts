import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, usersTable, residentsTable, ambulanceRequestsTable, notificationsTable } from "@workspace/db";
import { requireAuthMiddleware, requireAdminMiddleware } from "../middlewares/auth";
import { CreateAmbulanceRequestBody, UpdateAmbulanceRequestBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function buildAmbulanceWithResident(req: typeof ambulanceRequestsTable.$inferSelect) {
  const [resident] = await db
    .select()
    .from(residentsTable)
    .leftJoin(usersTable, eq(residentsTable.userId, usersTable.id))
    .where(eq(residentsTable.id, req.residentId));

  return {
    ...req,
    resident: resident ? { ...resident.residents, user: resident.users } : null,
  };
}

router.get("/ambulance", requireAuthMiddleware, async (req, res): Promise<void> => {
  const { status, residentId } = req.query as { status?: string; residentId?: string };
  const sessionUser = req.session.user!;

  let query = db.select().from(ambulanceRequestsTable).$dynamic();
  const conditions = [];

  if (sessionUser.role === "resident") {
    if (sessionUser.residentId) {
      conditions.push(eq(ambulanceRequestsTable.residentId, sessionUser.residentId));
    }
  } else if (residentId) {
    conditions.push(eq(ambulanceRequestsTable.residentId, residentId));
  }

  if (status) {
    conditions.push(eq(ambulanceRequestsTable.status, status));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const requests = await query.orderBy(ambulanceRequestsTable.requestedAt);
  const result = await Promise.all(requests.map(buildAmbulanceWithResident));
  res.json(result);
});

router.post("/ambulance", requireAuthMiddleware, async (req, res): Promise<void> => {
  const sessionUser = req.session.user!;
  if (!sessionUser.residentId) {
    res.status(400).json({ error: "No resident profile found" });
    return;
  }

  const parsed = CreateAmbulanceRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ambulance] = await db.insert(ambulanceRequestsTable).values({
    residentId: sessionUser.residentId,
    ...parsed.data,
    status: "pending",
  }).returning();

  const result = await buildAmbulanceWithResident(ambulance);
  res.status(201).json(result);
});

router.get("/ambulance/:id", requireAuthMiddleware, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [ambulance] = await db.select().from(ambulanceRequestsTable).where(eq(ambulanceRequestsTable.id, id));
  if (!ambulance) {
    res.status(404).json({ error: "Ambulance request not found" });
    return;
  }

  const result = await buildAmbulanceWithResident(ambulance);
  res.json(result);
});

router.patch("/ambulance/:id", requireAdminMiddleware, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = UpdateAmbulanceRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(ambulanceRequestsTable).where(eq(ambulanceRequestsTable.id, id));
  if (!existing) {
    res.status(404).json({ error: "Ambulance request not found" });
    return;
  }

  const [updated] = await db
    .update(ambulanceRequestsTable)
    .set(parsed.data)
    .where(eq(ambulanceRequestsTable.id, id))
    .returning();

  // Send notification to resident
  const [resident] = await db.select().from(residentsTable).where(eq(residentsTable.id, existing.residentId));
  if (resident && parsed.data.status) {
    const statusMessages: Record<string, { title: string; message: string }> = {
      approved: { title: "Ambulance Request Approved", message: "Your ambulance request has been approved." },
      rejected: { title: "Ambulance Request Rejected", message: `Your ambulance request was rejected. ${parsed.data.adminRemarks ?? ""}` },
      dispatched: { title: "Ambulance Dispatched", message: "The ambulance has been dispatched to your location." },
      completed: { title: "Ambulance Request Completed", message: "Your ambulance request has been marked as completed." },
    };
    const notif = statusMessages[parsed.data.status];
    if (notif) {
      await db.insert(notificationsTable).values({
        userId: resident.userId,
        title: notif.title,
        message: notif.message,
        type: "ambulance",
        isRead: false,
      });
    }
  }

  const result = await buildAmbulanceWithResident(updated);
  res.json(result);
});

router.delete("/ambulance/:id", requireAuthMiddleware, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [updated] = await db
    .update(ambulanceRequestsTable)
    .set({ status: "cancelled" })
    .where(eq(ambulanceRequestsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Ambulance request not found" });
    return;
  }

  res.json({ success: true });
});

export default router;
