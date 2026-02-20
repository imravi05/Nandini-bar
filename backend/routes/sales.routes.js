import express from "express";
import {
  createSale,
  getSales,
  deleteSale
} from "../controllers/sales.controller.js";

import { validate } from "../middleware/validate.middleware.js";
import {
  createSaleSchema,
  saleIdParamSchema
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

export default router;