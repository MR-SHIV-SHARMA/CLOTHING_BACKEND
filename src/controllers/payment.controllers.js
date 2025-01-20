import mongoose from "mongoose";
import { Payment } from "../models/payment.models.js";
import { Order } from "../Models/order.models.js";
import { Product } from "../Models/adminmodels/product.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new payment
const createPayment = asyncHandler(async (req, res) => {
  const { order: orderId, paymentMethod, transactionId } = req.body;

  // Validate required fields
  if (!orderId || !paymentMethod) {
    throw new apiError(400, "Order ID and payment method are required.");
  }

  // Fetch order details using the orderId
  const order = await Order.findById(orderId);
  if (!order) {
    throw new apiError(404, "Order not found.");
  }

  // The amount is now taken from the order's grandTotal
  const amount = order.grandTotal;

  // Create the payment
  const payment = await Payment.create({
    order: orderId,
    paymentMethod,
    amount,
    transactionId,
  });

  return res
    .status(201)
    .json(new apiResponse(201, payment, "Payment created successfully."));
});

// Get all payments
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().populate("order");

  return res
    .status(200)
    .json(new apiResponse(200, payments, "Payments fetched successfully."));
});

// Get a payment by ID
const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await Payment.findById(id).populate("order");
  if (!payment) {
    throw new apiError(404, "Payment not found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, payment, "Payment fetched successfully."));
});

// Update a payment by ID
const updatePaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const paymentData = req.body;

  const updatedPayment = await Payment.findByIdAndUpdate(id, paymentData, {
    new: true,
  });

  if (!updatedPayment) {
    throw new apiError(404, "Payment not found.");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedPayment, "Payment updated successfully.")
    );
});

// Delete a payment by ID
const deletePaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedPayment = await Payment.findByIdAndDelete(id);
  if (!deletedPayment) {
    throw new apiError(404, "Payment not found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Payment deleted successfully."));
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentId, paymentStatus } = req.body;

  console.log("Received request to update payment status:");
  console.log("Payment ID:", paymentId);
  console.log("Payment Status:", paymentStatus);

  // Ensure paymentId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    console.log("Invalid Payment ID:", paymentId);
    throw new apiError(400, "Invalid Payment ID");
  }

  console.log("Payment ID is valid. Fetching payment from the database...");

  // Fetch the payment using the Payment ID
  const payment = await Payment.findById(paymentId);

  if (!payment) {
    console.log("Payment not found for ID:", paymentId);
    throw new apiError(404, "Payment not found");
  }

  console.log("Payment found:", payment);

  // Update the payment status
  console.log("Updating payment status...");
  payment.paymentStatus = paymentStatus;

  // Save the updated payment status
  await payment.save();

  console.log("Payment status updated successfully:", payment);

  res.status(200).json({
    success: true,
    message: "Payment status updated successfully",
    payment,
  });
});

const updateOrderPaymentStatus = asyncHandler(async (req, res) => {
  const { orderId, paymentStatus } = req.body;

  // Ensure orderId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new apiError(400, "Invalid Order ID");
  }

  // Fetch the order using the ObjectId
  const order = await Order.findById(orderId);
  if (!order) {
    throw new apiError(404, "Order not found");
  }

  // Update the payment status to the provided status
  order.paymentStatus = paymentStatus;
  await order.save();

  // Now, call updateProductStock after order payment status is updated
  await updateProductStock(order.items); // Ensure the stock is updated after payment

  res.status(200).json({
    success: true,
    message: "Payment status updated successfully",
    order,
  });
});

// Function to update product stock
const updateProductStock = async (orderItems) => {
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock -= item.quantity; // Reduce stock
      await product.save();
    }
  }
};

// Create Shipping Details after payment
const createShipping = asyncHandler(async (req, res) => {
  const { orderId, trackingNumber, carrier } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new apiError(404, "Order not found");
  }

  const shipping = await Shipping.create({
    order: orderId,
    trackingNumber,
    carrier,
    status: "pending",
  });

  res.status(201).json({ success: true, shipping });
});

// Track Order Status
const getOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId).populate("shippingDetails");
  if (!order) {
    throw new apiError(404, "Order not found");
  }

  res.status(200).json({ success: true, order });
});

// Order History for Users
// View Past Orders
const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const orders = await Order.find({ user: userId }).populate("shippingDetails");
  res.status(200).json({ success: true, orders });
});

// Handling Cancellations/Returns
// Order Cancellations: Implement logic for users to cancel an order before it's processed or shipped.

export {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentById,
  deletePaymentById,
  updateOrderPaymentStatus,
  updatePaymentStatus,
  createShipping,
  getOrderStatus,
  getUserOrders,
};
