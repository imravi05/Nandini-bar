import express from "express";
import {
  getInventory,
  createInventory,
  adjustInventory,
  updateInventory,
  deleteInventory,
  getStockAdjustments
} from "../controllers/inventory.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authenticate);

/* GET */
router.get("/", authorizeRoles("ADMIN", "INVENTORY"), getInventory);

/* CREATE */
router.post("/", authorizeRoles("ADMIN"), createInventory);

/* ADJUST */
router.post(
  "/adjust",
  authorizeRoles("ADMIN", "INVENTORY"),
  adjustInventory
);

/* UPDATE EXACT */
router.put("/:id", authorizeRoles("ADMIN"), updateInventory);

/* DELETE */
router.delete("/:id", authorizeRoles("ADMIN"), deleteInventory);

/* HISTORY */
router.get(
  "/adjustments/:productId",
  authorizeRoles("ADMIN"),
  getStockAdjustments
);

export default router;