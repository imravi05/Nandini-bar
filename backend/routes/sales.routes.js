import express from "express";
import {
  createSale,
  getSales,
  deleteSale
} from "../controllers/sales.controller.js";

import { validate } from "../middlewares/validate.middleware.js";
import {
  createSaleSchema,
  saleIdParamSchema,
  salesQuerySchema
} from "../validations/sale.validation.js";

const router = express.Router();

router.get("/", getSales);

router.post(
  "/",
  validate(createSaleSchema),
  createSale
);

router.delete(
  "/:id",
  validate(saleIdParamSchema, "params"),
  deleteSale
);
router.get(
  "/",
  validate(salesQuerySchema, "query"),
  getSales
);
export default router;