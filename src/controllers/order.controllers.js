import { Order } from "../Models/order.models.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Address } from "../Models/address.models.js";
import { Cart } from "../Models/cart.models.js";

// Create a new order
const createOrder = asyncHandler(async (req, res) => {
  const user = req.user._id;
  const { addressId } = req.body;

  // Validate address
  const address = await Address.findOne({ _id: addressId, user });
  if (!address) {
    throw new apiError(400, "Invalid address");
  }

  // Get the user's cart
  const cart = await Cart.findOne({ user }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    throw new apiError(400, "Cart is empty");
  }

  // Calculate totals
  const totalPrice = cart.totalPrice;
  const grandTotal = totalPrice + cart.tax - cart.discount;

  // Create order
  const order = await Order.create({
    user,
    items: cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    })),
    totalPrice,
    tax: cart.tax,
    discount: cart.discount,
    grandTotal,
    shippingAddress: address._id,
  });

  // Clear cart after order creation
  await Cart.findOneAndUpdate({ user }, { items: [] });

  res
    .status(201)
    .json({ success: true, message: "Order created successfully", order });
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
