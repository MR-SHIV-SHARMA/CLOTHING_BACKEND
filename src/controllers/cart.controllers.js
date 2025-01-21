import mongoose from "mongoose";
import { Cart } from "../Models/cart.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../Models/user.models.js";
import { Order } from "../Models/order.models.js";
import {
  calculateTax,
  calculateShippingDetails,
  calculateDiscount,
} from "../utils/calculateTax.js";

const calculateCart = (cart) => {
  const totalPrice = cart.items.reduce((sum, item) => {
    const productPrice = item.product.price;
    return sum + productPrice * item.quantity;
  }, 0);

  const shippingCharges = calculateShippingDetails(cart.items).reduce(
    (sum, details) => sum + details.shippingCharge,
    0
  ); // Dynamic shipping charge calculation
  const discount = cart.items.reduce((sum, item) => {
    return (
      sum +
      (item.product.discount &&
      new Date() >= new Date(item.product.discount.startDate) &&
      new Date() <= new Date(item.product.discount.endDate)
        ? (item.product.price * item.product.discount.percentage) / 100
        : 0) *
        item.quantity
    );
  }, 0);

  const tax = calculateTax(cart.items); // Tax calculated dynamically
  const grandTotal = totalPrice + tax + shippingCharges - discount;
  const roundedTotal = Math.round(grandTotal);

  return {
    totalPrice,
    tax,
    shippingCharges,
    discount,
    grandTotal: roundedTotal,
  };
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

  const cartDetails = calculateCart(cart);

  cart.totalPrice = cartDetails.totalPrice;
  cart.tax = cartDetails.tax;
  cart.discount = cartDetails.discount;

  return res
    .status(200)
    .json(
      new apiResponse(200, { cart, cartDetails }, "Cart fetched successfully")
    );
});

// Add item to cart
const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, appliedCoupon } = req.body;

  if (!productId || !quantity) {
    throw new apiError(400, "Product ID and Quantity are required.");
  }

  const userId = req.admin._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Find the cart and populate all product details
  let cart = await Cart.findOne({ user: userId }).populate("items.product");

  if (!cart) {
    // Create a new cart if it doesn't exist
    cart = new Cart({
      user: userId,
      items: [{ product: productId, quantity }],
    });
    await cart.populate("items.product");
  } else {
    // Check if the product already exists in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product._id.toString() === productId
    );

    if (itemIndex > -1) {
      // If the product exists, update the quantity
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add the new product to the cart
      cart.items.push({ product: productId, quantity });
    }

    if (appliedCoupon) {
      cart.appliedCoupon = appliedCoupon; // Apply coupon if provided
    }
  }

  // Save the updated cart
  await cart.save();

  // Populate the cart again to ensure all product details are included
  cart = await Cart.findById(cart._id).populate("items.product");

  const cartDetails = calculateCart(cart);

  // Update cart values in the database
  cart.totalPrice = cartDetails.totalPrice;
  cart.tax = cartDetails.tax;
  cart.discount = cartDetails.discount;
  await cart.save();

  return res.status(200).json(
    new apiResponse(
      200,
      {
        cart,
        cartDetails, // Send full cart details in response
      },
      "Item added to cart successfully"
    )
  );
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
  cart.shippingDetails = calculateShippingDetails(cart.items);
  cart.discount = calculateDiscount(cart.items);

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

// Increase item quantity
const increaseQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new apiError(400, "Product ID is required.");
  }

  let userId = req.admin._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    throw new apiError(404, "Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product._id.toString() === productId
  );

  if (itemIndex > -1) {
    // Increase the quantity of the existing item
    cart.items[itemIndex].quantity += 1;
  } else {
    // Add new item if not found
    cart.items.push({ product: productId, quantity: 1 });
  }

  // Recalculate the cart details after the update
  cart.tax = calculateTax(cart.items);
  cart.shippingDetails = calculateShippingDetails(cart.items);
  cart.discount = calculateDiscount(cart.items);

  await cart.save(); // Save the updated cart
  return res
    .status(200)
    .json(new apiResponse(200, cart, "Quantity increased successfully"));
});

// Decrease item quantity
const decreaseQuantity = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    throw new apiError(400, "Product ID is required.");
  }

  let userId = req.admin._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    throw new apiError(404, "Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product._id.toString() === productId
  );

  if (itemIndex > -1) {
    // Decrease quantity but ensure it doesn't go below 1
    if (cart.items[itemIndex].quantity > 1) {
      cart.items[itemIndex].quantity -= 1;
    } else {
      return res
        .status(400)
        .json({ message: "Quantity cannot be less than 1." });
    }
  } else {
    return res.status(404).json({ message: "Item not found in cart." });
  }

  // Recalculate the cart details after the update
  cart.tax = calculateTax(cart.items);
  cart.shippingDetails = calculateShippingDetails(cart.items);
  cart.discount = calculateDiscount(cart.items);

  await cart.save(); // Save the updated cart
  return res
    .status(200)
    .json(new apiResponse(200, cart, "Quantity decreased successfully"));
});

// Checkout controller: for placing orders
const checkout = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new apiError(404, "User not found.");
  }

  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw new apiError(400, "Cart is empty, cannot proceed with checkout.");
  }

  // Validate shippingAddress
  const { shippingAddress } = req.body;
  if (!shippingAddress || !mongoose.Types.ObjectId.isValid(shippingAddress)) {
    throw new apiError(400, "Invalid shipping address.");
  }

  // Ensure each item has the price from the populated product
  const items = cart.items.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.product.price, // Ensure price is set
  }));

  // Calculate total price, tax, shipping, and discount
  const cartDetails = calculateCart(cart);
  if (!cartDetails.grandTotal || cartDetails.grandTotal <= 0) {
    throw new apiError(400, "Invalid cart value.");
  }

  // Create Order
  const order = new Order({
    user: userId,
    items: items,
    totalPrice: cartDetails.totalPrice,
    tax: cartDetails.tax,
    shippingDetails: cartDetails.shippingDetails,
    discount: cartDetails.discount,
    grandTotal: cartDetails.grandTotal,
    status: "Pending", // or "Paid" if payment is integrated
    appliedCoupon: cart.appliedCoupon,
    shippingAddress: shippingAddress, // Now validated ObjectId
  });

  await order.save();

  // Optionally, clear cart after successful checkout
  await Cart.deleteOne({ user: userId });

  return res.status(201).json({
    message: "Order placed successfully.",
    order,
  });
});

export {
  getCartByUserId,
  addItemToCart,
  removeItemFromCart,
  clearCart,
  increaseQuantity,
  decreaseQuantity,
  checkout,
};
