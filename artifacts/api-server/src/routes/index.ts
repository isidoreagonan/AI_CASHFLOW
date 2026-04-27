import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import coursesRouter from "./courses";
import modulesRouter from "./modules";
import moduleActionsRouter from "./module-actions";
import lessonsRouter from "./lessons";
import lessonActionsRouter from "./lesson-actions";
import progressRouter from "./progress";
import filesRouter from "./files";
import usersRouter from "./users";
import leadsRouter from "./leads";
import dashboardRouter from "./dashboard";
import paymentRouter from "./payment";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/courses", coursesRouter);
router.use("/courses/:courseId/modules", modulesRouter);
router.use("/modules", moduleActionsRouter);
router.use("/modules/:moduleId/lessons", lessonsRouter);
router.use("/lessons", lessonActionsRouter);
router.use("/progress", progressRouter);
router.use("/files", filesRouter);
router.use("/users", usersRouter);
router.use("/leads", leadsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/payment", paymentRouter);
router.use(storageRouter);

export default router;
