import { Cart } from "../Models/cart.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../Models/user.models.js";
import {
  calculateTax,
  calculateShippingCharges,
} from "../utils/calculateTax.js";

const calculateCart = (cart) => {
  const totalPrice = cart.items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const tax = calculateTax(cart.items);
  const shippingCharges = calculateShippingCharges(cart.items);

  // Apply discount (if any)
  const discount = cart.discount || 0;

  const grandTotal = totalPrice + tax + shippingCharges - discount;

  return { totalPrice, tax, shippingCharges, discount, grandTotal };
};

// Get cart by user ID
const getCartByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const cart = await Cart.findOne({ user: userId })
    .populate("items.product")
    .populate("appliedCoupon");

  if (!cart) {
    throw new apiError(404, "Cart not found");
  }

  const calculatedCart = calculateCart(cart);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { ...cart.toObject(), ...calculatedCart },
        "Cart fetched successfully"
      )
    );
});

// Add item to cart
const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, appliedCoupon } = req.body;

  if (!productId || !quantity) {
    throw new apiError(400, "Product ID and Quantity are required.");
  }

  let userId = req.admin._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  let cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [{ product: productId, quantity }],
      appliedCoupon,
      tax: 0,
      discount: 0,
    });
    await cart.populate("items.product");
    cart.tax = calculateTax(cart.items);
    cart.shippingCharges = calculateShippingCharges(cart.items);
    await cart.save();
    return res
      .status(201)
      .json(new apiResponse(201, cart, "Item added to cart successfully"));
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product._id.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.populate("items.product");

  if (appliedCoupon) {
    cart.appliedCoupon = appliedCoupon;
    cart.discount = 20; // Example coupon logic, update accordingly
  }

  cart.tax = calculateTax(cart.items);
  cart.shippingCharges = calculateShippingCharges(cart.items);

  await cart.save();
  return res
    .status(200)
    .json(new apiResponse(200, cart, "Item added to cart successfully"));
});

// Remove item from cart
const removeItemFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new apiError(400, "Product ID is required.");
  }

  let userId = req.admin._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new apiError(404, "Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  cart.tax = calculateTax(cart.items);
  cart.discount = cart.items.length === 0 ? 0 : cart.discount;
  cart.shippingCharges = calculateShippingCharges(cart.items);

  await cart.save();
  return res
    .status(200)
    .json(new apiResponse(200, cart, "Item removed from cart successfully"));
});

// Clear cart for a user
const clearCart = asyncHandler(async (req, res) => {
  let userId = req.admin._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const cart = await Cart.findOneAndDelete({ user: userId });
  if (!cart) {
    throw new apiError(404, "Cart not found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Cart cleared successfully"));
});

export { getCartByUserId, addItemToCart, removeItemFromCart, clearCart };
