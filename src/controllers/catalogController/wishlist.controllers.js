import { Wishlist } from "../../Models/catalogModels/wishlist.models.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../Models/userModels/user.models.js";

// Create or update wishlist for a user
const createOrUpdateWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const userId = req.admin._id;
  const user = await User.findById(userId);

  if (!user) {
    throw new apiError(400, "User ID is required.");
  }

  // Find the wishlist for the user
  let wishlist = await Wishlist.findOne({ user: user });

  if (wishlist) {
    // Check if product is already in the wishlist
    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
      return res
        .status(200)
        .json(new apiResponse(200, wishlist, "Product added to wishlist"));
    } else {
      throw new apiError(400, "Product is already in the wishlist.");
    }
  } else {
    // Create a new wishlist if it doesn't exist
    wishlist = await Wishlist.create({ user: user, products: [productId] });
    return res
      .status(201)
      .json(
        new apiResponse(201, wishlist, "Wishlist created and product added")
      );
  }
});

// Get wishlist for a user
const getWishlistByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const wishlist = await Wishlist.findOne({ user: userId }).populate(
    "products"
  );

  if (!wishlist) {
    throw new apiError(404, "Wishlist not found for this user.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, wishlist, "Wishlist fetched successfully"));
});

// Remove product from wishlist
const removeProductFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const userId = req.admin._id;
  const user = await User.findById(userId);

  const wishlist = await Wishlist.findOne({ user: user });

  if (!wishlist) {
    throw new apiError(404, "Wishlist not found for this user.");
  }

  // Remove product from wishlist
  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== productId
  );

  await wishlist.save();

  return res
    .status(200)
    .json(new apiResponse(200, wishlist, "Product removed from wishlist"));
});

export {
  createOrUpdateWishlist,
  getWishlistByUserId,
  removeProductFromWishlist,
};
