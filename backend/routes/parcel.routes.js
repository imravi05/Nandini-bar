import express from "express";
import { createParcel } from "../controllers/parcel.controller.js";

const router = express.Router();

router.post("/parcel", createParcel);

export default router;