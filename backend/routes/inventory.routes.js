import express from "express";
import * as inventoryController from "../controllers/inventory.controller.js";
import {authenticate} from "../middlewares/auth.middleware.js"

const router = express.Router()

router.use(authenticate);
// get inventory
router.get("/", inventoryController.getInventory);
// restock
router.post("/restock", inventoryController.restock);
//adjust
router.patch("/adjust", inventoryController.handleUpdate);

router.get("/history/:productId", inventoryController.getHistory);

// delete
router.delete("/delete", inventoryController.deleteInventory);



export default router;