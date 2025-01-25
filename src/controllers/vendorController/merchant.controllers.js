import { Merchant } from "../../Models/vendorModels/merchant.models.js";
import { ActivityLog } from "../../Models/adminModels/activityLog.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendEmail } from "../../helpers/mailer.js";
import { User } from "../../Models/userModels/user.models.js";
import { Brand } from "../../Models/adminmodels/brand.models.js";
import { uploadFileToCloudinary } from "../../utils/cloudinary.js";

// Create a new merchant
const createMerchant = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new apiError(422, "Email and password are required!");
  }

  // Check if a merchant with the email already exists
  const existingMerchant = await User.findOne({ email, role: "merchant" });
  if (existingMerchant) {
    throw new apiError(422, "A merchant already exists with this email!");
  }

  // Create a new user for the merchant
  const newMerchant = new User({
    email,
    password,
    role: "merchant",
  });

  await newMerchant.save();

  // Create a corresponding merchant record with placeholder data
  const merchant = new Merchant({
    _id: newMerchant._id,
    email: newMerchant.email,
    name: "N/A",
    phone: Math.floor(Math.random() * 10000000000)
      .toString()
      .padStart(10, "0"), // Random 10-digit phone
    panCard: `PAN${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    aadhaarCard: Math.floor(Math.random() * 1000000000000)
      .toString()
      .padStart(12, "0"), // Random 12-digit Aadhaar
    gstNumber: `GST${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
    companyName: "N/A",
    ownerName: "N/A",
    storeLocation: {
      address: "N/A",
      city: "N/A",
      state: "N/A",
      postalCode: "000000",
    },
  });

  try {
    await merchant.save();
  } catch (error) {
    console.error("Error saving merchant:", error);
    throw new apiError(500, "Failed to create merchant. Please try again.");
  }

  // Fetch the created merchant details
  const createdMerchant = await User.findById(newMerchant._id).select(
    "-password -refreshToken"
  );

  if (!createdMerchant) {
    throw new apiError(
      500,
      "Failed to create merchant. Please try again later."
    );
  }

  // Send email notification
  await sendEmail({
    email,
    subject: "Verify Your Merchant Account",
    message: `<p>Welcome Merchant, your merchant account has been created. Please verify your email.</p>`,
  });

  // Log the action
  await ActivityLog.create({
    adminId: newMerchant._id,
    action: `Created a merchant with email: ${email}`,
  });

  return res
    .status(201)
    .json(
      new apiResponse(
        201,
        createdMerchant,
        "Merchant created successfully",
        true
      )
    );
});

// Delete merchant by ID
const deleteMerchantById = asyncHandler(async (req, res) => {
  const merchant = await User.findByIdAndDelete(req.params.id);
  if (!merchant) {
    throw new apiError(404, "Merchant not found");
  }

  // Log activity
  await ActivityLog.create({
    action: "Merchant Deleted",
    adminId: merchant._id,
  });

  // Send email notification to the deleted merchant
  await sendEmail({
    email: merchant.email,
    subject: "Your Merchant Account Deleted",
    message: `Your merchant account has been deleted successfully. \n\nEmail: ${merchant.email}`,
  });

  return res.status(200).json(
    new apiResponse(200, {
      message: "Merchant deleted successfully!",
      deletedMerchant: {
        id: merchant._id,
        email: merchant.email,
      },
    })
  );
});

// Update merchant by ID
const updateMerchantById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Extract required fields
  const { ownerName, aadhaarCard, panCard } = req.body;

  // Check required fields for update
  if (!ownerName || !aadhaarCard || !panCard) {
    return res.status(400).json({
      message: "Missing required fields: ownerName, aadhaarCard, or panCard",
    });
  }

  // Check if a merchant exists
  const merchant = await Merchant.findById(id);
  if (!merchant) {
    return res.status(404).json({
      message: "Merchant not found. Please register the merchant first.",
    });
  }

  // Update the existing merchant
  const updatedMerchant = await Merchant.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  // Log activity for update
  await ActivityLog.create({
    action: "Merchant details updated successfully",
    adminId: merchant._id,
    details: `Updated Merchant ID: ${id}`,
  });

  return res.status(200).json({
    message: "Merchant updated successfully!",
    updatedMerchant,
  });
});

// get merchant by ID
const getMerchantAccountById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Find merchant by ID
    const merchant = await User.findById(id);

    if (!merchant) {
      return res.status(404).json({
        message: "Merchant not found",
      });
    }

    return res.status(200).json({
      message: "Merchant details retrieved successfully!",
      merchant,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
});

// Get all merchant accounts
const getAllMerchantAccounts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = "createdAt" } = req.query; // Default values for pagination and sorting

  try {
    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch merchants with pagination and sorting
    const merchants = await User.find({ role: "merchant" }) // Filter for merchants
      .sort({ [sort]: 1 }) // Sort by the specified field (ascending by default)
      .skip(skip)
      .limit(Number(limit));

    if (!merchants || merchants.length === 0) {
      return res.status(404).json({
        message: "No merchants found",
      });
    }

    // Get the total count of merchants for pagination info
    const totalMerchants = await User.countDocuments({ role: "merchant" }); // Count only merchants

    return res.status(200).json({
      message: "Merchants retrieved successfully!",
      merchants,
      pagination: {
        totalMerchants,
        currentPage: Number(page),
        totalPages: Math.ceil(totalMerchants / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
});

// Create a new brand for a merchant
const createBrand = asyncHandler(async (req, res) => {
  const { id } = req.params; // Merchant ID
  const { brandName } = req.body;

  // Validate inputs
  if (!id || !brandName) {
    return res.status(400).json({
      message: "Merchant ID and brand name are required.",
    });
  }

  // Find the merchant
  const merchant = await Merchant.findById(id);
  if (!merchant) {
    return res.status(404).json({
      message: "Merchant not found.",
    });
  }

  // Check if the merchant already has a brand
  const existingBrandForMerchant = await Brand.findOne({
    merchant: merchant._id,
  });
  if (existingBrandForMerchant) {
    return res.status(400).json({
      message: "A brand has already been created for this merchant.",
    });
  }

  // Check if the brand name already exists for another merchant
  const existingBrandWithName = await Brand.findOne({ name: brandName });
  if (existingBrandWithName) {
    return res.status(400).json({
      message: `The brand name "${brandName}" has already been registered by another merchant.`,
    });
  }

  // Upload brand logo to Cloudinary (if provided)
  const logoLocalPath = req.files?.logo[0]?.path;

  if (!logoLocalPath) {
    throw new apiError(400, "Please select a valid image file for your logo.");
  }

  const logo = await uploadFileToCloudinary(logoLocalPath);

  if (!logo) {
    throw new apiError(400, "Failed to upload logo file. Please try again.");
  }

  // Create the brand
  const brand = await Brand.create({
    name: brandName,
    logo: logo.url,
    merchant: merchant._id, // Store merchant ID instead of the entire object
  });

  // Link the brand to the merchant
  if (!merchant.brands) merchant.brands = [];
  merchant.brands.push(brand._id);
  await merchant.save();

  return res.status(201).json({
    message: "Brand created successfully!",
    brand,
  });
});

// Update a brand by ID
const updateBrandById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { brandName } = req.body;

  // Validate required fields
  if (!brandName) {
    throw new apiError(400, "Brand name is required.");
  }

  const brand = await Brand.findById(id);
  if (!brand) {
    throw new apiError(404, "Brand not found");
  }

  // Upload brand logo to Cloudinary (if provided)
  const logoLocalPath = req.file?.path;

  if (!logoLocalPath) {
    throw new apiError(400, "Please select a valid image file for your logo");
  }

  const logo = await uploadFileToCloudinary(logoLocalPath);

  if (!logo) {
    throw new apiError(400, "Failed to upload logo file. Please try again");
  }

  const updatedBrand = await Brand.findByIdAndUpdate(
    id,
    {
      $set: {
        name: brandName,
        logo: logo.url,
      },
    },
    { new: true }
  );
  if (!updatedBrand) {
    throw new apiError(404, "Brand not found");
  }
  return res
    .status(200)
    .json(
      new apiResponse(200, updatedBrand, "Brand updated successfully", true)
    );
});

// Delete a brand by ID
const deleteBrandById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const authenticatedMerchantId = req.user.id;

  // Find the brand by ID
  const brand = await Brand.findById(id);
  if (!brand) {
    throw new apiError(404, "Brand not found");
  }

  // Check if the authenticated merchant is the owner of the brand
  if (brand.merchant.toString() !== authenticatedMerchantId) {
    throw new apiError(403, "You are not authorized to delete this brand");
  }

  // Delete the brand
  await Brand.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Brand deleted successfully"));
});

export {
  createMerchant,
  deleteMerchantById,
  updateMerchantById,
  getMerchantAccountById,
  getAllMerchantAccounts,
  createBrand,
  updateBrandById,
  deleteBrandById,
};
