import { Order } from "../../Models/orderModels/order.models.js";
import { Product } from "../../Models/adminmodels/product.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";

// Get total sales
export const getTotalSales = asyncHandler(async (req, res) => {
  const [{ totalSales } = { totalSales: 0 }] = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$total" },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(200, { totalSales }, "Total sales fetched successfully")
    );
});

// Get sales by product
export const getSalesByProduct = asyncHandler(async (req, res) => {
  const sales = await Order.aggregate([
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: "$items.product",
        totalSales: {
          $sum: { $multiply: ["$items.price", "$items.quantity"] },
        },
        totalQuantity: { $sum: "$items.quantity" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $project: {
        productId: "$_id",
        productName: "$product.name",
        totalSales: 1,
        totalQuantity: 1,
      },
    },
    { $sort: { totalSales: -1 } },
  ]);

  return res
    .status(200)
    .json(new apiResponse(200, sales, "Sales by product fetched successfully"));
});

// Get sales by category
export const getSalesByCategory = asyncHandler(async (req, res) => {
  const sales = await Order.aggregate([
    {
      $unwind: "$items",
    },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $group: {
        _id: "$product.category",
        totalSales: {
          $sum: { $multiply: ["$items.price", "$items.quantity"] },
        },
        totalQuantity: { $sum: "$items.quantity" },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: "$category",
    },
    {
      $project: {
        categoryName: "$category.name",
        totalSales: 1,
        totalQuantity: 1,
      },
    },
    { $sort: { totalSales: -1 } },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(200, sales, "Sales by category fetched successfully")
    );
});

// Get top-selling products
export const getTopSellingProducts = asyncHandler(async (req, res) => {
  const topProducts = await Order.aggregate([
    {
      $unwind: "$items",
    },
    {
      $group: {
        _id: "$items.product",
        totalQuantity: { $sum: "$items.quantity" },
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    },
    {
      $project: {
        productId: "$_id",
        productName: "$product.name",
        totalQuantity: 1,
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        topProducts,
        "Top-selling products fetched successfully"
      )
    );
});
