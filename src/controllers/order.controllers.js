import { Order } from "../models/order.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new order
const createOrder = asyncHandler(async (req, res) => {
  const { user, items, totalAmount, shippingAddress } = req.body;

  // Validate required fields
  if (!user || !items || !totalAmount || !shippingAddress) {
    throw new apiError(
      400,
      "User, items, total amount, and shipping address are required."
    );
  }

  // Create the order
  const order = await Order.create({
    user,
    items,
    totalAmount,
    shippingAddress,
  });

  return res
    .status(201)
    .json(new apiResponse(201, order, "Order created successfully."));
});

// Get all orders
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate(
    "user items.product shippingAddress"
  );

  return res
    .status(200)
    .json(new apiResponse(200, orders, "Orders fetched successfully."));
});

// Get a single order by ID
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id).populate(
    "user items.product shippingAddress"
  );
  if (!order) {
    throw new apiError(404, "Order not found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, order, "Order fetched successfully."));
});

// Update an order by ID
const updateOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const orderData = req.body;

  const updatedOrder = await Order.findByIdAndUpdate(id, orderData, {
    new: true,
  });

  if (!updatedOrder) {
    throw new apiError(404, "Order not found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, updatedOrder, "Order updated successfully."));
});

// Delete an order by ID
const deleteOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedOrder = await Order.findByIdAndDelete(id);
  if (!deletedOrder) {
    throw new apiError(404, "Order not found.");
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Order deleted successfully."));
});

export {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderById,
  deleteOrderById,
};
