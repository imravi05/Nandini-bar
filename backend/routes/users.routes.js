import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  activateUser
} from "../controllers/users.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id", updateUser);
router.patch("/:id/deactivate", deactivateUser);
router.patch("/:id/activate", activateUser);

export default router;