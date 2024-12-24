import express from "express";
import {
  createAdmin,
  loginAdmin,
  getAdmins,
  deleteAdmin,
} from "../controllers/admin.controller.js"; // Apne controller ka path sahi karein

const router = express.Router();

router.post("/create", createAdmin);
router.post("/login", loginAdmin);
router.get("/", getAdmins);
router.delete("/:id", deleteAdmin);

export default router;
