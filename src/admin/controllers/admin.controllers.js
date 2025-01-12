import { Admin } from "../models/admin.models.js";
import { ActivityLog } from "../models/activityLog.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all admins
const getAllAdmins = asyncHandler(async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const createAdmin = asyncHandler(async (req, res) => {});
const getAdminById = asyncHandler(async (req, res) => {});
const updateAdminById = asyncHandler(async (req, res) => {});
const deleteAdminById = asyncHandler(async (req, res) => {});

export {
  createAdmin,
  getAdminById,
  updateAdminById,
  deleteAdminById,
  getAllAdmins,
};
