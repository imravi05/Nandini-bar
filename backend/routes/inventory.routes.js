import express from "express";
import {
  getInventory,
  adjustInventory
} from "../controllers/inventory.controller.js";

const router = express.Router();

router.get("/", getInventory);
router.post("/adjust", adjustInventory);

export default router;