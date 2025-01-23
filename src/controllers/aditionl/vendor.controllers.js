import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { apiError } from "../../utils/apiError.js";
import { Vendor } from "../../models/aditionl/vendor.models.js";

const createVendor = asyncHandler(async (req, res) => {
  const vendor = new Vendor(req.body);
  await vendor.save();
  return res
    .status(201)
    .json(new apiResponse(201, vendor, "Vendor created successfully."));
});

const getVendorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendor = await Vendor.findById(id);
  if (!vendor) {
    throw new apiError(404, "Vendor not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, vendor, "Vendor fetched successfully."));
});

const getAllVendors = asyncHandler(async (req, res) => {
  const vendors = await Vendor.find();
  return res
    .status(200)
    .json(new apiResponse(200, vendors, "All vendors fetched successfully."));
});

const updateVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendor = await Vendor.findByIdAndUpdate(id, req.body, { new: true });
  if (!vendor) {
    throw new apiError(404, "Vendor not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, vendor, "Vendor updated successfully."));
});

const deleteVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vendor = await Vendor.findByIdAndDelete(id);
  if (!vendor) {
    throw new apiError(404, "Vendor not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, null, "Vendor deleted successfully."));
});

export {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
};
