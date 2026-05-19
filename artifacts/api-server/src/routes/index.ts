import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import residentsRouter from "./residents";
import appointmentsRouter from "./appointments";
import ambulanceRouter from "./ambulance";
import schedulesRouter from "./schedules";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(residentsRouter);
router.use(appointmentsRouter);
router.use(ambulanceRouter);
router.use(schedulesRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);
router.use(reportsRouter);

export default router;
