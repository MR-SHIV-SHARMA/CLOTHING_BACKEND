import express from "express";
import {
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from "../../controllers/systemController/faq.controllers.js";

const router = express.Router();

// Get all faqs
router.get("/", getAllFaqs);

// Create a new faq
router.post("/", createFaq);

// Update a faq by ID
router.put("/:id", updateFaq);

// Delete a faq by ID
router.delete("/:id", deleteFaq);

export default router;
