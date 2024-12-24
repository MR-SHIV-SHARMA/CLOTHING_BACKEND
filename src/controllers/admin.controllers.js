import { Admin } from "../Models/admin.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all admins
const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().select("-password -refreshToken");
  return res
    .status(200)
    .json(new apiResponse(200, admins, "Admins retrieved successfully"));
});

// Get an admin by ID
const getAdminById = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id).select(
    "-password -refreshToken"
  );
  if (!admin) {
    throw new apiError(404, "Admin not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, admin, "Admin retrieved successfully"));
});

// Create a new admin
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    throw new apiError(422, "All fields are required");
  }

  const existedAdmin = await Admin.findOne({ email });
  if (existedAdmin) {
    throw new apiError(422, "Email already in use");
  }

  const newAdmin = await Admin.create({
    name,
    email,
    password,
    role,
  });

  return res
    .status(201)
    .json(new apiResponse(201, newAdmin, "Admin created successfully"));
});

// Update admin by ID
const updateAdminById = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;

  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    { name, email, role },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  if (!admin) {
    throw new apiError(404, "Admin not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, admin, "Admin updated successfully"));
});

// Delete admin by ID
const deleteAdminById = asyncHandler(async (req, res) => {
  const admin = await Admin.findByIdAndDelete(req.params.id).select(
    "-password -refreshToken"
  );
  if (!admin) {
    throw new apiError(404, "Admin not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, {}, "Admin deleted successfully"));
});

// Exporting the controller functions
export {
  getAllAdmins,
  getAdminById,
  createAdmin,
  updateAdminById,
  deleteAdminById,
};
