import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../Models/user.models.js";

// Get all admins with pagination
const getAllAdmins = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Filter for admins with role "admin"
  const query = { role: "admin" };

  const admins = await User.find(query)
    .select("-password")
    .skip(skip)
    .limit(Number(limit));

  const totalAdmins = await User.countDocuments(query);

  res.status(200).json(
    new apiResponse(200, "Admins retrieved successfully", {
      admins,
      totalAdmins,
      currentPage: page,
      totalPages: Math.ceil(totalAdmins / limit),
    })
  );
});

// Get an admin by ID
const getAdminById = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.params.id).select("-password");
  if (!admin) {
    return apiError(res, 404, "Admin not found");
  }
  res
    .status(200)
    .json(new apiResponse(200, "Admin retrieved successfully", admin));
});

export { getAdminById, getAllAdmins };
