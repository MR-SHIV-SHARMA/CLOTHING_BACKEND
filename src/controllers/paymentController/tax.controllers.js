import Tax from "../../Models/paymentModels/tax.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const getAllTaxes = asyncHandler(async (req, res) => {
  const taxes = await Tax.find({});
  return res
    .status(200)
    .json(new apiResponse(200, taxes, "All taxes fetched successfully"));
});

const createTax = asyncHandler(async (req, res) => {
  const tax = await Tax.create(req.body);
  return res
    .status(201)
    .json(new apiResponse(201, tax, "Tax created successfully"));
});

const getTax = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tax = await Tax.findById(id);
  if (!tax) {
    throw new apiError(404, "Tax not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, tax, "Tax retrieved successfully"));
});

const updateTax = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedTax = await Tax.findByIdAndUpdate(id, req.body, { new: true });
  if (!updatedTax) {
    throw new apiError(404, "Tax not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, updatedTax, "Tax updated successfully"));
});

const deleteTax = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedTax = await Tax.findByIdAndDelete(id);
  if (!deletedTax) {
    throw new apiError(404, "Tax not found");
  }
  return res
    .status(204)
    .json(new apiResponse(204, null, "Tax deleted successfully"));
});

export { getAllTaxes, createTax, getTax, updateTax, deleteTax };
