import { Router, type IRouter } from "express";
import { eq, and, gte, lte } from "drizzle-orm";
import { db, healthSchedulesTable } from "@workspace/db";
import { requireAuthMiddleware, requireAdminMiddleware } from "../middlewares/auth";
import { CreateScheduleBody, UpdateScheduleBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/schedules", requireAuthMiddleware, async (req, res): Promise<void> => {
  const { status, from, to } = req.query as { status?: string; from?: string; to?: string };

  let query = db.select().from(healthSchedulesTable).$dynamic();
  const conditions = [];

  if (status) conditions.push(eq(healthSchedulesTable.status, status));
  if (from) conditions.push(gte(healthSchedulesTable.scheduleDate, from));
  if (to) conditions.push(lte(healthSchedulesTable.scheduleDate, to));

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const schedules = await query.orderBy(healthSchedulesTable.scheduleDate);
  res.json(schedules);
});

router.post("/schedules", requireAdminMiddleware, async (req, res): Promise<void> => {
  const parsed = CreateScheduleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [schedule] = await db.insert(healthSchedulesTable).values({
    ...parsed.data,
    currentSlots: 0,
    status: parsed.data.status ?? "open",
  }).returning();

  res.status(201).json(schedule);
});

router.get("/schedules/:id", requireAuthMiddleware, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [schedule] = await db.select().from(healthSchedulesTable).where(eq(healthSchedulesTable.id, id));
  if (!schedule) {
    res.status(404).json({ error: "Schedule not found" });
    return;
  }

  res.json(schedule);
});

router.patch("/schedules/:id", requireAdminMiddleware, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = UpdateScheduleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(healthSchedulesTable)
    .set(parsed.data)
    .where(eq(healthSchedulesTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Schedule not found" });
    return;
  }

  res.json(updated);
});

router.delete("/schedules/:id", requireAdminMiddleware, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [deleted] = await db
    .delete(healthSchedulesTable)
    .where(eq(healthSchedulesTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Schedule not found" });
    return;
  }

  res.json({ success: true });
});

export default router;
