import { Router, type IRouter } from "express";
import { eq, count, and } from "drizzle-orm";
import { db, usersTable, residentsTable, appointmentsTable, ambulanceRequestsTable, notificationsTable } from "@workspace/db";
import { requireAuthMiddleware, requireAdminMiddleware } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/admin", requireAdminMiddleware, async (req, res): Promise<void> => {
  const [totalResidentsResult] = await db.select({ count: count() }).from(residentsTable);
  const totalResidents = Number(totalResidentsResult?.count ?? 0);

  const allAppointments = await db.select().from(appointmentsTable);
  const pendingAppointments = allAppointments.filter(a => a.status === "pending").length;
  const approvedAppointments = allAppointments.filter(a => a.status === "approved").length;
  const completedCheckups = allAppointments.filter(a => a.status === "completed").length;

  const allAmbulance = await db.select().from(ambulanceRequestsTable);
  const pendingAmbulanceRequests = allAmbulance.filter(a => a.status === "pending").length;

  const recentAppointmentsRaw = allAppointments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentAppointments = await Promise.all(recentAppointmentsRaw.map(async (appt) => {
    const [resident] = await db
      .select()
      .from(residentsTable)
      .leftJoin(usersTable, eq(residentsTable.userId, usersTable.id))
      .where(eq(residentsTable.id, appt.residentId));
    return { ...appt, resident: resident ? { ...resident.residents, user: resident.users } : null };
  }));

  const recentAmbulanceRaw = allAmbulance
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    .slice(0, 5);

  const recentAmbulanceRequests = await Promise.all(recentAmbulanceRaw.map(async (amb) => {
    const [resident] = await db
      .select()
      .from(residentsTable)
      .leftJoin(usersTable, eq(residentsTable.userId, usersTable.id))
      .where(eq(residentsTable.id, amb.residentId));
    return { ...amb, resident: resident ? { ...resident.residents, user: resident.users } : null };
  }));

  const statusCounts = ["pending", "approved", "rejected", "rescheduled", "completed", "cancelled"].map(status => ({
    status,
    count: allAppointments.filter(a => a.status === status).length,
  }));

  const urgencyCounts = ["low", "medium", "high"].map(urgencyLevel => ({
    urgencyLevel,
    count: allAmbulance.filter(a => a.urgencyLevel === urgencyLevel).length,
  }));

  res.json({
    totalResidents,
    pendingAppointments,
    approvedAppointments,
    pendingAmbulanceRequests,
    completedCheckups,
    recentAppointments,
    recentAmbulanceRequests,
    appointmentsByStatus: statusCounts,
    ambulanceByUrgency: urgencyCounts,
  });
});

router.get("/dashboard/resident", requireAuthMiddleware, async (req, res): Promise<void> => {
  const sessionUser = req.session.user!;
  if (!sessionUser.residentId) {
    res.json({
      upcomingAppointment: null,
      recentAppointments: [],
      recentAmbulanceRequests: [],
      unreadNotifications: 0,
    });
    return;
  }

  const appointments = await db
    .select()
    .from(appointmentsTable)
    .where(eq(appointmentsTable.residentId, sessionUser.residentId));

  const upcomingAppointment = appointments
    .filter(a => a.status === "approved")
    .sort((a, b) => new Date(a.preferredDate ?? "").getTime() - new Date(b.preferredDate ?? "").getTime())[0] ?? null;

  const recentAppointments = appointments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const ambulanceRequests = await db
    .select()
    .from(ambulanceRequestsTable)
    .where(eq(ambulanceRequestsTable.residentId, sessionUser.residentId));

  const recentAmbulanceRequests = ambulanceRequests
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    .slice(0, 3);

  const [unreadResult] = await db
    .select({ count: count() })
    .from(notificationsTable)
    .where(and(
      eq(notificationsTable.userId, sessionUser.id),
      eq(notificationsTable.isRead, false)
    ));

  const unreadNotifications = Number(unreadResult?.count ?? 0);

  res.json({
    upcomingAppointment,
    recentAppointments,
    recentAmbulanceRequests,
    unreadNotifications,
  });
});

export default router;
