import express from "express";
import {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdminById,
  deleteAdminById,
} from "../controllers/admin.controllers.js"; // Apne controller ka path sahi karein
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
  getNonDeletedProducts,
} from "../controllers/admin.controllers.js";
import multer from "multer";


const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Create a new product
router.route("/").post(
  upload.single([
    {
      name: "images",
      maxCount: 10,
    },
  ]),
  createProduct
);

// Get all products with optional filters
router.route("/").get(getAllProducts);

// Get a specific product by ID
router.route("/:id").get(getProductById);

// Update a product by ID
router.route("/:id").put(updateProductById);

// Soft delete a product by ID
router.route("/:id").delete(deleteProductById);

// Get all non-deleted products (optional)
router.route("/non-deleted").get(getNonDeletedProducts);

router.post("/create", createAdmin);
// router.post("/login", loginAdmin);
router.get("/", getAllAdmins);
router.get("/:id", getAdminById);
router.patch("/:id", updateAdminById);
router.delete("/:id", deleteAdminById);

export default router;
