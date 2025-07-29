import { Order } from "../../Models/orderModels/order.models.js";
import { Product } from "../../Models/adminmodels/product.models.js";
import { User } from "../../Models/userModels/user.models.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { apiError } from "../../utils/apiError.js";

/**
 * Get comprehensive sales dashboard data
 */
export const getSalesDashboard = asyncHandler(async (req, res) => {
  const { timeRange = "30d", startDate, endDate } = req.query;

  // Calculate date range
  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };
  } else {
    const now = new Date();
    let daysBack = 30;

    switch (timeRange) {
      case "7d":
        daysBack = 7;
        break;
      case "30d":
        daysBack = 30;
        break;
      case "90d":
        daysBack = 90;
        break;
      case "1y":
        daysBack = 365;
        break;
      default:
        daysBack = 30;
    }

    dateFilter = {
      createdAt: {
        $gte: new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000),
      },
    };
  }

  try {
    // Parallel execution of all analytics queries
    const [
      totalMetrics,
      salesTrend,
      topProducts,
      topCategories,
      customerMetrics,
      revenueByMonth,
      orderStatusBreakdown,
      averageOrderValue,
      geographicSales,
    ] = await Promise.all([
      // Total metrics
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            totalOrders: { $sum: 1 },
            totalItems: { $sum: { $sum: "$items.quantity" } },
            averageOrderValue: { $avg: "$total" },
          },
        },
      ]),

      // Sales trend (daily)
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
            items: { $sum: { $sum: "$items.quantity" } },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top selling products
      Order.aggregate([
        { $match: dateFilter },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            totalQuantity: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
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
        { $unwind: "$product" },
        {
          $project: {
            productId: "$_id",
            productName: "$product.name",
            category: "$product.category",
            totalQuantity: 1,
            totalRevenue: 1,
            averagePrice: { $divide: ["$totalRevenue", "$totalQuantity"] },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ]),

      // Top categories
      Order.aggregate([
        { $match: dateFilter },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.category",
            totalQuantity: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
            orderCount: { $addToSet: "$_id" },
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
        { $unwind: "$category" },
        {
          $project: {
            categoryName: "$category.name",
            totalQuantity: 1,
            totalRevenue: 1,
            orderCount: { $size: "$orderCount" },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]),

      // Customer metrics
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            uniqueCustomers: { $addToSet: "$user" },
            returningCustomers: {
              $sum: {
                $cond: [
                  {
                    $gt: [
                      {
                        $size: {
                          $filter: {
                            input: "$user",
                            cond: { $eq: ["$$this", "$user"] },
                          },
                        },
                      },
                      1,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            uniqueCustomers: { $size: "$uniqueCustomers" },
            returningCustomers: 1,
            newCustomers: {
              $subtract: [{ $size: "$uniqueCustomers" }, "$returningCustomers"],
            },
          },
        },
      ]),

      // Revenue by month
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // Order status breakdown
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalValue: { $sum: "$total" },
          },
        },
      ]),

      // Average order value trend
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            averageOrderValue: { $avg: "$total" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Geographic sales (if shipping address is available)
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$shippingAddress.state",
            totalRevenue: { $sum: "$total" },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ]),
    ]);

    // Calculate growth rates
    const previousPeriodFilter = {
      createdAt: {
        $gte: new Date(
          dateFilter.createdAt.$gte.getTime() -
            (dateFilter.createdAt.$gte.getTime() - new Date().getTime())
        ),
        $lt: dateFilter.createdAt.$gte,
      },
    };

    const previousPeriodMetrics = await Order.aggregate([
      { $match: previousPeriodFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
        },
      },
    ]);

    // Calculate growth rates
    const currentRevenue = totalMetrics[0]?.totalRevenue || 0;
    const previousRevenue = previousPeriodMetrics[0]?.totalRevenue || 0;
    const revenueGrowth =
      previousRevenue > 0
        ? (
            ((currentRevenue - previousRevenue) / previousRevenue) *
            100
          ).toFixed(2)
        : 0;

    const currentOrders = totalMetrics[0]?.totalOrders || 0;
    const previousOrders = previousPeriodMetrics[0]?.totalOrders || 0;
    const orderGrowth =
      previousOrders > 0
        ? (((currentOrders - previousOrders) / previousOrders) * 100).toFixed(2)
        : 0;

    // Prepare dashboard response
    const dashboardData = {
      overview: {
        totalRevenue: totalMetrics[0]?.totalRevenue || 0,
        totalOrders: totalMetrics[0]?.totalOrders || 0,
        totalItems: totalMetrics[0]?.totalItems || 0,
        averageOrderValue: totalMetrics[0]?.averageOrderValue || 0,
        revenueGrowth: `${revenueGrowth}%`,
        orderGrowth: `${orderGrowth}%`,
      },

      trends: {
        salesTrend: salesTrend.map((item) => ({
          date: item._id,
          revenue: item.revenue,
          orders: item.orders,
          items: item.items,
        })),
        averageOrderValueTrend: averageOrderValue.map((item) => ({
          date: item._id,
          averageOrderValue: item.averageOrderValue,
          orderCount: item.orderCount,
        })),
        revenueByMonth: revenueByMonth.map((item) => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
          revenue: item.revenue,
          orders: item.orders,
        })),
      },

      products: {
        topSellingProducts: topProducts,
        topCategories: topCategories,
      },

      customers: {
        metrics: customerMetrics[0] || {
          uniqueCustomers: 0,
          returningCustomers: 0,
          newCustomers: 0,
        },
      },

      orders: {
        statusBreakdown: orderStatusBreakdown,
        geographicDistribution: geographicSales.filter((item) => item._id), // Remove null states
      },

      insights: {
        conversionMetrics: {
          // Add conversion rate calculations here if you have visitor data
        },
        performanceIndicators: {
          topPerformingCategory: topCategories[0]?.categoryName || "N/A",
          bestSellingProduct: topProducts[0]?.productName || "N/A",
          averageItemsPerOrder:
            totalMetrics[0]?.totalItems / totalMetrics[0]?.totalOrders || 0,
        },
      },
    };

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          dashboardData,
          "Sales dashboard data retrieved successfully"
        )
      );
  } catch (error) {
    throw new apiError(500, `Failed to fetch dashboard data: ${error.message}`);
  }
});

/**
 * Get sales performance comparison
 */
export const getSalesComparison = asyncHandler(async (req, res) => {
  const { period1, period2, comparisonType = "month" } = req.query;

  if (!period1 || !period2) {
    throw new apiError(400, "Both period1 and period2 are required");
  }

  const [period1Data, period2Data] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(period1.split(",")[0]),
            $lte: new Date(period1.split(",")[1]),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$total" },
        },
      },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(period2.split(",")[0]),
            $lte: new Date(period2.split(",")[1]),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: "$total" },
        },
      },
    ]),
  ]);

  const comparison = {
    period1: period1Data[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
    },
    period2: period2Data[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
    },
    growth: {
      revenue:
        period2Data[0] && period1Data[0]
          ? (
              ((period2Data[0].totalRevenue - period1Data[0].totalRevenue) /
                period1Data[0].totalRevenue) *
              100
            ).toFixed(2)
          : 0,
      orders:
        period2Data[0] && period1Data[0]
          ? (
              ((period2Data[0].totalOrders - period1Data[0].totalOrders) /
                period1Data[0].totalOrders) *
              100
            ).toFixed(2)
          : 0,
      aov:
        period2Data[0] && period1Data[0]
          ? (
              ((period2Data[0].averageOrderValue -
                period1Data[0].averageOrderValue) /
                period1Data[0].averageOrderValue) *
              100
            ).toFixed(2)
          : 0,
    },
  };

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        comparison,
        "Sales comparison data retrieved successfully"
      )
    );
});

/**
 * Get real-time sales metrics
 */
export const getRealTimeMetrics = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayMetrics, liveMetrics] = await Promise.all([
    // Today's metrics
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          todayRevenue: { $sum: "$total" },
          todayOrders: { $sum: 1 },
          todayItems: { $sum: { $sum: "$items.quantity" } },
        },
      },
    ]),

    // Last hour metrics
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: null,
          lastHourRevenue: { $sum: "$total" },
          lastHourOrders: { $sum: 1 },
        },
      },
    ]),
  ]);

  const realTimeData = {
    today: todayMetrics[0] || {
      todayRevenue: 0,
      todayOrders: 0,
      todayItems: 0,
    },
    lastHour: liveMetrics[0] || { lastHourRevenue: 0, lastHourOrders: 0 },
    timestamp: new Date().toISOString(),
  };

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        realTimeData,
        "Real-time metrics retrieved successfully"
      )
    );
});

/**
 * Export sales data for external analysis
 */
export const exportSalesData = asyncHandler(async (req, res) => {
  const { format = "json", startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const salesData = await Order.find(dateFilter)
    .populate("user", "fullname email")
    .populate("items.product", "name category")
    .lean();

  if (format === "csv") {
    // Convert to CSV format
    const csvData = salesData.map((order) => ({
      orderId: order._id,
      customerName: order.user?.fullname || "Guest",
      customerEmail: order.user?.email || "",
      orderDate: order.createdAt,
      total: order.total,
      status: order.status,
      items: order.items.map((item) => item.product?.name).join("; "),
    }));

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=sales-data.csv");

    // Simple CSV conversion (in production, use a proper CSV library)
    const csvString = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    return res.send(csvString);
  }

  return res
    .status(200)
    .json(new apiResponse(200, salesData, "Sales data exported successfully"));
});
