import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAdminMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

/**
 * GET /users?role=health_worker
 * List users filtered by role (admin only)
 */
router.get("/users", requireAdminMiddleware, async (req, res): Promise<void> => {
  const { role } = req.query as { role?: string };

  let rows = await db
    .select({
      id: usersTable.id,
      fullName: usersTable.fullName,
      email: usersTable.email,
      role: usersTable.role,
      status: usersTable.status,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable);

  if (role) {
    rows = rows.filter((u) => u.role === role);
  }

  // Only return active users
  rows = rows.filter((u) => u.status === "active");

  res.json(rows);
});

export default router;
