import express from "express";
import { closeDay, getDailyReport, reopenDay} from "../controllers/dailyClosing.controller.js";

const router = express.Router();

router.post("/close", closeDay);
router.get("/report", getDailyReport);
router.post("/reopen", reopenDay);

export default router;