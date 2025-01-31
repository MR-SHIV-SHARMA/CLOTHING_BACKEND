import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Order } from "../../Models/orderModels/order.models.js";
import { Product } from "../../Models/adminModels/product.models.js";
import { Shipping } from "../../Models/orderModels/shipping.models.js";
import { Payment } from "../../Models/paymentModels/payment.models.js";

// Create a new payment
const createPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod, mobileNumber, name, redirectUrl } = req.body;

  // Validate required fields
  if (!orderId || !paymentMethod || !mobileNumber || !name || !redirectUrl) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Fetch order details using the orderId
  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }

  // The amount is taken from the order's grandTotal
  const paymentAmount = order.grandTotal;

  // Generate a unique transaction ID
  const transactionId = uuidv4();

  // Payment Payload for PhonePe
  const paymentPayload = {
    merchantId: process.env.MERCHANT_ID,
    merchantUserId: name,
    mobileNumber: mobileNumber,
    amount: paymentAmount * 100, // converting amount to paise
    merchantTransactionId: transactionId, // Using the unique transaction ID
    redirectUrl: `${redirectUrl}?id=${transactionId}`,
    redirectMode: "GET",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };

  const payload = Buffer.from(JSON.stringify(paymentPayload)).toString(
    "base64"
  );
  const keyIndex = 1;
  const string = payload + "/pg/v1/pay" + process.env.MERCHANT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "POST",
    url: process.env.MERCHANT_BASE_URL,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    },
    data: {
      request: payload,
    },
  };

  try {
    // Initiate payment request
    const response = await axios.request(options);
    const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;

    // Save payment in the database
    const payment = new Payment({
      order: orderId,
      paymentMethod: "phonepe", // Hardcoded for PhonePe
      paymentStatus: "pending", // Default status
      amount: paymentAmount,
      transactionId: transactionId, // Using the unique transaction ID
    });

    await payment.save(); // Save the payment record in the database

    return res.status(200).json({
      msg: "Payment initiated successfully",
      url: redirectUrl,
    });
  } catch (error) {
    console.error("Error in payment initiation:", error);
    return res.status(500).json({ error: "Failed to initiate payment" });
  }
});

// Status callback endpoint
const paymentStatus = asyncHandler(async (req, res) => {
  const merchantTransactionId = req.query.id || req.body.id; // Handle GET and POST

  // Validate the transaction ID
  if (!merchantTransactionId) {
    return res.status(400).json({ error: "Transaction ID is required." });
  }

  const keyIndex = 1;
  const string =
    `/pg/v1/status/${process.env.MERCHANT_ID}/${merchantTransactionId}` +
    process.env.MERCHANT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `${process.env.MERCHANT_STATUS_URL}/${process.env.MERCHANT_ID}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": process.env.MERCHANT_ID,
    },
  };

  try {
    const response = await axios.request(options);
    const phonePeResponse = response.data;

    if (phonePeResponse.success === true) {
      // Update the existing payment record in the database
      const updatedPayment = await Payment.findOneAndUpdate(
        { transactionId: merchantTransactionId },
        { paymentStatus: "success" }, // Update the payment status to 'success'
        { new: true } // Return the updated document
      );

      if (updatedPayment) {
        // Update the corresponding order status if necessary
        const order = await Order.findById(updatedPayment.order);
        if (order) {
          order.status = "Success";
          order.paymentStatus = "paid";
          await order.save();
        }
      }

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully.",
        paymentStatus: "success",
      });
    } else {
      // Handle payment failure
      await Payment.findOneAndUpdate(
        { transactionId: merchantTransactionId },
        { paymentStatus: "failed" }, // Update the payment status to 'failed'
        { new: true }
      );

      return res.status(200).json({
        success: false,
        message: "Payment verification failed.",
        paymentStatus: "failed",
      });
    }
  } catch (error) {
    console.error("Error in payment status check:", error);
    return res.status(500).json({ error: "Failed to verify payment status." });
  }
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

// Update the payment status of a payment (not order) to confirm payment
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

// Update the payment status of an order to confirm payment
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
  paymentStatus,
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
