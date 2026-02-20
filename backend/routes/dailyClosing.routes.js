import express from "express";
import {
  closeDay,
  getDailyReport,
  reopenDay
} from "../controllers/dailyClosing.controller.js";

import { validate } from "../middlewares/validate.middleware.js";
import {
  dateQuerySchema,
  reopenSchema
} from "../validations/daily.validation.js";

const router = express.Router();

router.post("/close", closeDay);

router.get(
  "/report",
  validate(dateQuerySchema, "query"),
  getDailyReport
);

router.post(
  "/reopen",
  validate(reopenSchema),
  reopenDay
);

export default router;