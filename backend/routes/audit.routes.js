import express from "express";
import { getAuditLogs } from "../controllers/audit.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { auditQuerySchema } from "../validations/audit.validation.js";

const router = express.Router();

router.get(
  "/",
  validate(auditQuerySchema, "query"),
  getAuditLogs
);

export default router;