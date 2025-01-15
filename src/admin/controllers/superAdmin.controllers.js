import { Merchant } from "../models/merchant.models.js";
import { ActivityLog } from "../models/activityLog.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendEmail } from "../helpers/mailer.js";
import { User } from "../../Models/user.models.js";
import { Brand } from "../models/brand.models.js";
import { uploadFileToCloudinary } from "../../utils/cloudinary.js";

// Function to Create Default Super Admin
const createDefaultSuperAdmin = asyncHandler(async (req, res) => {
  const defaultEmail = process.env.DEFAULT_SUPER_ADMIN_EMAIL;
  const defaultPassword = process.env.DEFAULT_SUPER_ADMIN_PASSWORD;

  // Check if default credentials are provided
  if (!defaultEmail || !defaultPassword) {
    console.error(
      "Default Super Admin credentials are not set in the .env file."
    );
    throw new apiError(500, "Default Super Admin credentials are missing.");
  }

  try {
    // Check if a default super admin already exists
    const existingSuperAdmin = await User.findOne({
      email: defaultEmail,
      role: "super-admin",
      isDefaultSuperAdmin: true,
    });

    if (existingSuperAdmin) {
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            { email: existingSuperAdmin.email },
            "Default Super Admin already exists.",
            true
          )
        );
    }

    // Create the default super admin
    const superAdmin = new User({
      email: defaultEmail,
      password: defaultPassword,
      role: "super-admin",
      isDefaultSuperAdmin: true, // Flag to identify default super admin
    });

    await superAdmin.save();

    // Send notification email
    await sendEmail({
      email: defaultEmail,
      subject: "Your Default Super Admin Account",
      message: `Your Super Admin account has been created successfully. \n\nEmail: ${defaultEmail}\nPassword: ${defaultPassword}`,
    });

    return res
      .status(201)
      .json(
        new apiResponse(
          201,
          { email: defaultEmail },
          "Default Super Admin created successfully.",
          true
        )
      );
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res
        .status(200)
        .json(
          new apiResponse(
            200,
            { email: error.keyValue.email },
            "Default Super Admin already exists.",
            true
          )
        );
    }

    console.error("Error creating default Super Admin:", error);
    throw new apiError(500, "Error creating default Super Admin.");
  }
});

// Register a new Super Admin
const registerSuperAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new apiError(422, "Email and password are required!");
  }

  if (!req.admin.isDefaultSuperAdmin) {
    throw new apiError(
      403,
      "Only the default super admin can create another super admin!"
    );
  }

  const existingSuperAdmin = await User.findOne({
    email,
    role: "super-admin",
  });

  if (existingSuperAdmin) {
    throw new apiError(422, "A super admin already exists with this email!");
  }

  const newSuperAdmin = new User({
    email,
    password,
    role: "super-admin",
  });

  await newSuperAdmin.save();

  const createdSuperAdmin = await User.findById(newSuperAdmin._id).select(
    "-password -refreshToken"
  );

  if (!createdSuperAdmin) {
    throw new apiError(
      500,
      "Failed to create super admin. Please try again later."
    );
  }

  await sendEmail({
    email: createdSuperAdmin.email,
    subject: "Your Super Admin Account",
    message: `Your super admin account has been successfully created.\n\nEmail: ${createdSuperAdmin.email}\nPlease log in with the credentials provided to you.`,
  });

  await ActivityLog.create({
    adminId: req.admin._id,
    action: `Created a new super admin with email: ${email}`,
  });

  return res
    .status(201)
    .json(
      new apiResponse(
        201,
        createdSuperAdmin,
        "Super admin created successfully!",
        true
      )
    );
});

// Super Admin deletes another Super Admin
const deleteSuperAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!req.admin.isDefaultSuperAdmin) {
    throw new apiError(
      403,
      "Only the default super admin can delete other super admins!"
    );
  }

  if (id === req.admin._id.toString()) {
    throw new apiError(400, "You cannot delete the default super admin!");
  }

  const superAdminToDelete = await User.findOne({
    _id: id,
    role: "super-admin",
  });

  if (!superAdminToDelete) {
    throw new apiError(404, "Super admin not found!");
  }

  await User.findByIdAndDelete(id);

  await ActivityLog.create({
    adminId: req.admin._id,
    action: `Deleted super admin with email: ${superAdminToDelete.email}`,
  });

  await sendEmail({
    email: superAdminToDelete.email,
    subject: "Super Admin Account Deleted",
    message: `Your super admin account has been deleted successfully by the default super admin. \n\nEmail: ${superAdminToDelete.email}`,
  });

  return res.status(200).json({
    message: "Super admin deleted successfully!",
    deletedSuperAdmin: {
      id: superAdminToDelete._id,
      email: superAdminToDelete.email,
    },
  });
});

// Super Admin creates a new admin
const superAdminCreateAdmin = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const validRoles = ["admin"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Invalid role provided!" });
  }

  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) {
    return res
      .status(400)
      .json({ message: "Admin with this email already exists!" });
  }

  const newAdmin = new User({
    email,
    password,
    role,
  });

  await newAdmin.save();

  await ActivityLog.create({
    adminId: req.admin._id,
    action: `Created new admin ${email}`,
  });

  await sendEmail({
    email: newAdmin.email,
    subject: "Admin Account Created",
    message: `Your admin account has been created by the super admin.\n\nEmail: ${newAdmin.email}\nPlease log in with your provided credentials.`,
  });

  res.status(201).json({
    message: "Admin created successfully!",
    admin: {
      id: newAdmin._id,
      email: newAdmin.email,
      role: newAdmin.role,
    },
  });
});

// Super Admin deletes an admin by ID
const superAdminDeleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const admin = await User.findById(id);
  if (!admin) {
    return res.status(404).json({ message: "Admin not found!" });
  }

  await User.findByIdAndDelete(id);

  await ActivityLog.create({
    adminId: req.admin._id,
    action: `Deleted admin ${admin.email}`,
  });

  // Send email notification to the deleted admin
  await sendEmail({
    email: admin.email,
    subject: "Admin Account Deleted",
    message: `Your admin account has been deleted by the super admin. \n\nEmail: ${admin.email}`,
  });

  res.status(200).json({
    message: "Admin deleted successfully!",
    admin: {
      id: admin._id,
      email: admin.email,
      role: admin.role,
    },
  });
});

// Create a new merchant
const createMerchant = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new apiError(422, "Email and password are required!");
  }

  const existingMerchant = await User.findOne({
    email,
    role: "merchant",
  });

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
    _id: newMerchant._id, // use the same ID
    email: newMerchant.email,
    name: "N/A",
    phone: "N/A",
    panCard: "N/A",
    aadhaarCard: "N/A",
    gstNumber: "N/A",
    companyName: "N/A",
    ownerName: "N/A",
    storeLocation: {
      address: "N/A",
      city: "N/A",
      state: "N/A",
      postalCode: "N/A",
    },
  });

  await merchant.save();

  const createdMerchant = await User.findById(newMerchant._id).select(
    "-password -refreshToken"
  );

  if (!createdMerchant) {
    throw new apiError(500, "Failed to create admin. Please try again later.");
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
  const { id } = req.params;
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

  // Upload brand logo to Cloudinary (if provided)
  const logoLocalPath = req.files?.logo[0]?.path;

  if (!logoLocalPath) {
    throw new apiError(400, "Please select a valid image file for your logo");
  }

  const logo = await uploadFileToCloudinary(logoLocalPath);

  if (!logo) {
    throw new apiError(400, "Failed to upload logo file. Please try again");
  }

  // Create the brand
  const brand = await Brand.create({
    name: brandName,
    logo: logo.url,
    merchant: merchant,
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
  const deletedBrand = await Brand.findByIdAndDelete(id);
  if (!deletedBrand) {
    throw new apiError(404, "Brand not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, {}, "Brand deleted successfully"));
});

export {
  createDefaultSuperAdmin,
  registerSuperAdmin,
  deleteSuperAdmin,
  superAdminCreateAdmin,
  superAdminDeleteAdmin,
  createMerchant,
  deleteMerchantById,
  updateMerchantById,
  getMerchantAccountById,
  getAllMerchantAccounts,
  createBrand,
  updateBrandById,
  deleteBrandById,
};
