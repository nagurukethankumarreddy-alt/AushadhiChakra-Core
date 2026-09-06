import { Router, type IRouter } from "express";
import healthRouter from "./health";
import supplyRouter from "./supply";

const router: IRouter = Router();

router.use(healthRouter);
router.use(supplyRouter);

export default router;
