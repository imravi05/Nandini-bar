import express from "express";
import {
  createSale,
  getSales,
  deleteSale,
  parcelSale
} from "../controllers/sales.controller.js";


import { validate } from "../middlewares/validate.middleware.js";
import {
  createSaleSchema,
  saleIdParamSchema,
  salesQuerySchema
} from "../validations/sale.validation.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

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

router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "CASHIER"),
  validate(createSaleSchema),
  createSale
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN"),
  validate(saleIdParamSchema, "params"),
  deleteSale
);
router.post(
  "/parcel",
  authenticate,
  authorizeRoles("ADMIN", "CASHIER"),
  validate(createSaleSchema),
  parcelSale
)

export default router;