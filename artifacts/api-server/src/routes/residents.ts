import { Router, type IRouter } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, usersTable, residentsTable } from "@workspace/db";
import { requireAuthMiddleware, requireAdminMiddleware } from "../middlewares/auth";
import { UpdateResidentBody, VerifyResidentBody, DisableResidentBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/residents", requireAdminMiddleware, async (req, res): Promise<void> => {
  const { search, verified } = req.query as { search?: string; verified?: string };

  let rows = await db
    .select()
    .from(residentsTable)
    .leftJoin(usersTable, eq(residentsTable.userId, usersTable.id));

  if (search) {
    const s = `%${search}%`;
    rows = rows.filter(r =>
      (r.users?.fullName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.users?.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.residents.address ?? "").toLowerCase().includes(search.toLowerCase())
    );
  }

  if (verified !== undefined) {
    const v = verified === "true";
    rows = rows.filter(r => r.residents.verified === v);
  }

  const result = rows.map(r => ({
    ...r.residents,
    user: r.users,
  }));

  res.json(result);
});

router.get("/residents/:id", requireAuthMiddleware, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [row] = await db
    .select()
    .from(residentsTable)
    .leftJoin(usersTable, eq(residentsTable.userId, usersTable.id))
    .where(eq(residentsTable.id, id));

  if (!row) {
    res.status(404).json({ error: "Resident not found" });
    return;
  }

  res.json({ ...row.residents, user: row.users });
});

router.patch("/residents/:id", requireAuthMiddleware, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = UpdateResidentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(residentsTable)
    .set(parsed.data)
    .where(eq(residentsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Resident not found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId));
  res.json({ ...updated, user });
});

router.patch("/residents/:id/verify", requireAdminMiddleware, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = VerifyResidentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(residentsTable)
    .set({ verified: parsed.data.verified })
    .where(eq(residentsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Resident not found" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId));
  res.json({ ...updated, user });
});

router.patch("/residents/:id/disable", requireAdminMiddleware, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = DisableResidentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [resident] = await db.select().from(residentsTable).where(eq(residentsTable.id, id));
  if (!resident) {
    res.status(404).json({ error: "Resident not found" });
    return;
  }

  const [user] = await db
    .update(usersTable)
    .set({ status: parsed.data.status })
    .where(eq(usersTable.id, resident.userId))
    .returning();

  res.json({ ...resident, user });
});

export default router;
