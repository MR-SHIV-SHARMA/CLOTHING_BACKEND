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
import { StripeService } from "../../services/stripeService.js";

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

// ==================== STRIPE PAYMENT METHODS ====================

/**
 * Create Stripe payment intent
 */
const createStripePaymentIntent = asyncHandler(async (req, res) => {
  const { orderId, currency = 'usd', customerId } = req.body;

  if (!orderId) {
    throw new apiError(400, 'Order ID is required');
  }

  try {
    // Fetch order details
    const order = await Order.findById(orderId);
    if (!order) {
      throw new apiError(404, 'Order not found');
    }

    // Create payment intent using StripeService
    const paymentIntentData = await StripeService.createPaymentIntent({
      amount: order.grandTotal,
      currency,
      customerId,
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber || 'N/A'
      },
      description: `Payment for order ${order.orderNumber || order._id}`
    });

    // Save payment record in database
    const payment = new Payment({
      order: orderId,
      paymentMethod: 'stripe',
      paymentStatus: 'pending',
      amount: order.grandTotal,
      transactionId: paymentIntentData.paymentIntentId,
      stripePaymentIntentId: paymentIntentData.paymentIntentId,
      currency: currency.toUpperCase()
    });

    await payment.save();

    return res.status(200).json(
      new apiResponse(200, {
        clientSecret: paymentIntentData.clientSecret,
        paymentIntentId: paymentIntentData.paymentIntentId,
        amount: paymentIntentData.amount,
        currency: paymentIntentData.currency,
        paymentId: payment._id
      }, 'Stripe payment intent created successfully')
    );
  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    throw new apiError(500, error.message || 'Failed to create Stripe payment intent');
  }
});

/**
 * Create Stripe customer
 */
const createStripeCustomer = asyncHandler(async (req, res) => {
  const { email, name, phone, address } = req.body;

  if (!email || !name) {
    throw new apiError(400, 'Email and name are required');
  }

  try {
    const customerData = await StripeService.createCustomer({
      email,
      name,
      phone,
      address
    });

    return res.status(201).json(
      new apiResponse(201, customerData, 'Stripe customer created successfully')
    );
  } catch (error) {
    console.error('Stripe customer creation error:', error);
    throw new apiError(500, error.message || 'Failed to create Stripe customer');
  }
});

/**
 * Confirm Stripe payment
 */
const confirmStripePayment = asyncHandler(async (req, res) => {
  const { paymentIntentId, paymentMethodId } = req.body;

  if (!paymentIntentId || !paymentMethodId) {
    throw new apiError(400, 'Payment intent ID and payment method ID are required');
  }

  try {
    // Confirm payment using StripeService
    const confirmationResult = await StripeService.confirmPaymentIntent(paymentIntentId, paymentMethodId);

    // Update payment record in database
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      { 
        paymentStatus: confirmationResult.status === 'succeeded' ? 'success' : 'failed',
        paymentMethodId: paymentMethodId,
        confirmedAt: new Date()
      },
      { new: true }
    );

    if (payment && confirmationResult.status === 'succeeded') {
      // Update order status
      const order = await Order.findById(payment.order);
      if (order) {
        order.status = 'Success';
        order.paymentStatus = 'paid';
        await order.save();

        // Update product stock after successful payment
        await updateProductStock(order.items);
      }
    }

    return res.status(200).json(
      new apiResponse(200, {
        paymentIntent: confirmationResult,
        payment,
        status: confirmationResult.status
      }, 'Payment confirmation processed successfully')
    );
  } catch (error) {
    console.error('Stripe payment confirmation error:', error);
    throw new apiError(500, error.message || 'Failed to confirm Stripe payment');
  }
});

/**
 * Create Stripe refund
 */
const createStripeRefund = asyncHandler(async (req, res) => {
  const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;

  if (!paymentIntentId) {
    throw new apiError(400, 'Payment intent ID is required');
  }

  try {
    // Find the payment record
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) {
      throw new apiError(404, 'Payment not found');
    }

    // Create refund using StripeService
    const refundData = await StripeService.createRefund(paymentIntentId, amount, reason);

    // Update payment record
    payment.refundStatus = refundData.status;
    payment.refundId = refundData.refundId;
    payment.refundAmount = refundData.amount;
    payment.refundReason = refundData.reason;
    payment.refundedAt = new Date();
    await payment.save();

    // Update order status if fully refunded
    if (!amount || amount >= payment.amount) {
      const order = await Order.findById(payment.order);
      if (order) {
        order.status = 'Refunded';
        order.paymentStatus = 'refunded';
        await order.save();
      }
    }

    return res.status(200).json(
      new apiResponse(200, {
        refund: refundData,
        payment
      }, 'Refund created successfully')
    );
  } catch (error) {
    console.error('Stripe refund creation error:', error);
    throw new apiError(500, error.message || 'Failed to create refund');
  }
});

/**
 * Get Stripe payment details
 */
const getStripePaymentDetails = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.params;

  if (!paymentIntentId) {
    throw new apiError(400, 'Payment intent ID is required');
  }

  try {
    // Get payment details from Stripe
    const stripePaymentDetails = await StripeService.retrievePaymentIntent(paymentIntentId);

    // Get local payment record
    const localPayment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId })
      .populate('order');

    return res.status(200).json(
      new apiResponse(200, {
        stripeDetails: stripePaymentDetails,
        localPayment
      }, 'Payment details retrieved successfully')
    );
  } catch (error) {
    console.error('Get Stripe payment details error:', error);
    throw new apiError(500, error.message || 'Failed to retrieve payment details');
  }
});

/**
 * Handle Stripe webhook events
 */
const handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    throw new apiError(400, 'Missing Stripe signature');
  }

  if (!endpointSecret) {
    throw new apiError(500, 'Stripe webhook secret not configured');
  }

  try {
    const event = await StripeService.handleWebhook(req.body, signature, endpointSecret);

    // Handle specific events
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'refund.created':
        await handleRefundCreated(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json(
      new apiResponse(200, { received: true }, 'Webhook processed successfully')
    );
  } catch (error) {
    console.error('Stripe webhook error:', error);
    throw new apiError(400, error.message || 'Webhook signature verification failed');
  }
});

// Helper function to handle successful payments
const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { 
        paymentStatus: 'success',
        confirmedAt: new Date()
      },
      { new: true }
    );

    if (payment) {
      const order = await Order.findById(payment.order);
      if (order) {
        order.status = 'Success';
        order.paymentStatus = 'paid';
        await order.save();
        await updateProductStock(order.items);
      }
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
};

// Helper function to handle failed payments
const handlePaymentFailed = async (paymentIntent) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { paymentStatus: 'failed' },
      { new: true }
    );

    if (payment) {
      const order = await Order.findById(payment.order);
      if (order) {
        order.status = 'Failed';
        order.paymentStatus = 'failed';
        await order.save();
      }
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};

// Helper function to handle refund created
const handleRefundCreated = async (refund) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { stripePaymentIntentId: refund.payment_intent },
      { 
        refundStatus: refund.status,
        refundId: refund.id,
        refundAmount: refund.amount / 100, // Convert from cents
        refundReason: refund.reason,
        refundedAt: new Date()
      },
      { new: true }
    );

    if (payment) {
      const order = await Order.findById(payment.order);
      if (order && refund.amount >= (payment.amount * 100)) { // Full refund
        order.status = 'Refunded';
        order.paymentStatus = 'refunded';
        await order.save();
      }
    }
  } catch (error) {
    console.error('Error handling refund created:', error);
  }
};

/**
 * Create setup intent for saving payment methods
 */
const createSetupIntent = asyncHandler(async (req, res) => {
  const { customerId } = req.body;

  if (!customerId) {
    throw new apiError(400, 'Customer ID is required');
  }

  try {
    const setupIntentData = await StripeService.createSetupIntent(customerId);

    return res.status(200).json(
      new apiResponse(200, setupIntentData, 'Setup intent created successfully')
    );
  } catch (error) {
    console.error('Setup intent creation error:', error);
    throw new apiError(500, error.message || 'Failed to create setup intent');
  }
});

/**
 * Get customer payment methods
 */
const getCustomerPaymentMethods = asyncHandler(async (req, res) => {
  const { customerId } = req.params;

  if (!customerId) {
    throw new apiError(400, 'Customer ID is required');
  }

  try {
    const paymentMethods = await StripeService.getCustomerPaymentMethods(customerId);

    return res.status(200).json(
      new apiResponse(200, paymentMethods, 'Payment methods retrieved successfully')
    );
  } catch (error) {
    console.error('Get payment methods error:', error);
    throw new apiError(500, error.message || 'Failed to retrieve payment methods');
  }
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
  // Stripe methods
  createStripePaymentIntent,
  createStripeCustomer,
  confirmStripePayment,
  createStripeRefund,
  getStripePaymentDetails,
  handleStripeWebhook,
  createSetupIntent,
  getCustomerPaymentMethods,
};
