import { Cart } from "../models/cart.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create or update cart for a user
const createOrUpdateCart = asyncHandler(async (req, res) => {
  const { user, items } = req.body;

  // Validate required fields
  if (!user) {
    throw new apiError(400, "User ID is required.");
  }

  // Check if the cart already exists for the user
  let cart = await Cart.findOne({ user });

  if (cart) {
    // Update existing cart
    cart.items = items;
    await cart.save();
    return res
      .status(200)
      .json(new apiResponse(200, cart, "Cart updated successfully"));
  } else {
    // Create a new cart
    cart = await Cart.create({ user, items });
    return res
      .status(201)
      .json(new apiResponse(201, cart, "Cart created successfully"));
  }
});

// Get cart by user ID
const getCartByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    throw new apiError(404, "Cart not found");
  }
  return res
    .status(200)
    .json(new apiResponse(200, cart, "Cart fetched successfully"));
});

// Add item to cart
const addItemToCart = asyncHandler(async (req, res) => {
  const { userId, productId, quantity } = req.body;

  // Validate required fields
  if (!userId || !productId || !quantity) {
    throw new apiError(400, "User ID, Product ID, and Quantity are required.");
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    // Create a new cart if it doesn't exist
    cart = await Cart.create({
      user: userId,
      items: [{ product: productId, quantity }],
    });
    return res
      .status(201)
      .json(new apiResponse(201, cart, "Item added to cart successfully"));
  }

  // Check if the item already exists in the cart
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    // Update existing item quantity
    cart.items[itemIndex].quantity += quantity;
  } else {
    // Add new item to cart
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  return res
    .status(200)
    .json(new apiResponse(200, cart, "Item added to cart successfully"));
});

// Remove item from cart
const removeItemFromCart = asyncHandler(async (req, res) => {
  const { userId, productId } = req.body;

  // Validate required fields
  if (!userId || !productId) {
    throw new apiError(400, "User ID and Product ID are required.");
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new apiError(404, "Cart not found");
  }

  // Filter out the item to be removed
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );
  await cart.save();

  return res
    .status(200)
    .json(new apiResponse(200, cart, "Item removed from cart successfully"));
});

// Clear cart for a user
const clearCart = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // Validate required fields
  if (!userId) {
    throw new apiError(400, "User ID is required.");
  }

  const cart = await Cart.findOneAndDelete({ user: userId });
  if (!cart) {
    throw new apiError(404, "Cart not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Cart cleared successfully"));
});

export {
  createOrUpdateCart,
  getCartByUserId,
  addItemToCart,
  removeItemFromCart,
  clearCart,
};
