import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, reportsTable } from "@workspace/db";
import { requireAdminMiddleware } from "../middlewares/auth";
import { GenerateReportBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reports", requireAdminMiddleware, async (req, res): Promise<void> => {
  const reports = await db
    .select()
    .from(reportsTable)
    .orderBy(reportsTable.createdAt);

  res.json(reports.reverse());
});

router.post("/reports", requireAdminMiddleware, async (req, res): Promise<void> => {
  const sessionUser = req.session.user!;
  const parsed = GenerateReportBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [report] = await db.insert(reportsTable).values({
    generatedBy: sessionUser.id,
    reportType: parsed.data.reportType,
    startDate: parsed.data.startDate ?? null,
    endDate: parsed.data.endDate ?? null,
    fileUrl: null,
  }).returning();

  res.status(201).json(report);
});

router.get("/reports/:id", requireAdminMiddleware, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [report] = await db.select().from(reportsTable).where(eq(reportsTable.id, id));
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.json(report);
});

router.delete("/reports/:id", requireAdminMiddleware, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const [deleted] = await db
    .delete(reportsTable)
    .where(eq(reportsTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  res.json({ success: true });
});

export default router;
