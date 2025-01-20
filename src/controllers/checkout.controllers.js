import mongoose from "mongoose";
import { Cart } from "../Models/cart.models.js";
import { Order } from "../Models/order.models.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../Models/user.models.js";
import {
  calculateTax,
  calculateShippingDetails,
  calculateDiscount,
} from "../utils/calculateTax.js";

const calculateCart = (cart) => {
  const totalPrice = cart.items.reduce((total, item) => {
    const discount =
      (item.product.price * (item.product.discount?.percentage || 0)) / 100;
    const discountedPrice = item.product.price - discount;
    return total + discountedPrice * item.quantity;
  }, 0);

  const tax = calculateTax(cart.items);
  const shippingDetails = calculateShippingDetails(cart.items);
  const shippingCharges = shippingDetails.reduce(
    (total, detail) => total + detail.shippingCharge,
    0
  );

  // Calculate total discount
  const discount = calculateDiscount(cart.items);

  // Calculate grand total
  const grandTotal = totalPrice + tax + shippingCharges - discount;

  // Round the grand total to the nearest integer or specify the number of decimal places you want
  const roundedGrandTotal = Math.round(grandTotal);

  return {
    totalPrice,
    tax,
    shippingDetails,
    shippingCharges,
    discount,
    grandTotal: roundedGrandTotal,
  };
};

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

export { checkout };
