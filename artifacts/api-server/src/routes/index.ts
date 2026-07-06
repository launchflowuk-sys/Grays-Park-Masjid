import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import prayerRouter from "./prayer";
import announcementsRouter from "./announcements";
import eventsRouter from "./events";
import coursesRouter from "./courses";
import donationsRouter from "./donations";
import galleryRouter from "./gallery";
import servicesRouter from "./services";
import enquiriesRouter from "./enquiries";
import volunteersRouter from "./volunteers";
import staffRouter from "./staff";
import newsRouter from "./news";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(prayerRouter);
router.use(announcementsRouter);
router.use(eventsRouter);
router.use(coursesRouter);
router.use(donationsRouter);
router.use(galleryRouter);
router.use(servicesRouter);
router.use(enquiriesRouter);
router.use(volunteersRouter);
router.use(staffRouter);
router.use(newsRouter);
router.use(settingsRouter);

export default router;
