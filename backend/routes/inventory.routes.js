import express from "express";
import {
  getInventory,
  adjustInventory
} from "../controllers/inventory.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { adjustInventorySchema } from "../validations/inventory.validation.js";

const router = express.Router();

router.get("/", getInventory);

router.post(
  "/adjust",
  validate(adjustInventorySchema),
  adjustInventory
);

export default router;