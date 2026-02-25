import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
// Suggested fix for product.routes.js
import { productIdParamSchema } from "../validations/product.validation.js";
import { validate } from "../middlewares/validate.middleware.js";


const router = express.Router();
// Logic to bypass security in development
const skipAuth = process.env.NODE_ENV === "development"; 

if (!skipAuth) {
  router.use(authenticate);
  router.use(authorizeRoles("ADMIN"));
}


// router.use(authenticate);
//router.use(authorizeRoles("ADMIN"));

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/:id", getProductById);
// router.put("/:id", updateProduct);
// router.delete("/:id", deleteProduct);
router.put("/:id", validate(productIdParamSchema, "params"), updateProduct);
router.delete("/:id", validate(productIdParamSchema, "params"), deleteProduct);

export default router;