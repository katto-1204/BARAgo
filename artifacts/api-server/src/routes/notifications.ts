import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import { requireAuthMiddleware, requireAdminMiddleware } from "../middlewares/auth";
import { CreateNotificationBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/notifications", requireAuthMiddleware, async (req, res): Promise<void> => {
  const sessionUser = req.session.user!;

  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, sessionUser.id))
    .orderBy(notificationsTable.createdAt);

  res.json(notifications.reverse());
});

router.post("/notifications", requireAdminMiddleware, async (req, res): Promise<void> => {
  const parsed = CreateNotificationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [notif] = await db.insert(notificationsTable).values(parsed.data).returning();
  res.status(201).json(notif);
});

router.patch("/notifications/:id/read", requireAuthMiddleware, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, id));

  res.json({ success: true });
});

router.patch("/notifications/read-all", requireAuthMiddleware, async (req, res): Promise<void> => {
  const sessionUser = req.session.user!;

  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.userId, sessionUser.id));

  res.json({ success: true });
});

export default router;
