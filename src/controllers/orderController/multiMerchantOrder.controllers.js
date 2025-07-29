import { MultiMerchantOrderService } from '../../services/multiMerchantOrderService.js';
import { MultiMerchantOrder } from '../../Models/orderModels/multiMerchantOrder.models.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { apiError } from '../../utils/apiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

/**
 * Create a new multi-merchant order from cart
 */
export const createOrderFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const orderData = req.body;

  try {
    const order = await MultiMerchantOrderService.createOrderFromCart(userId, orderData);

    return res.status(201).json(
      new apiResponse(201, {
        order: {
          orderNumber: order.orderNumber,
          orderId: order._id,
          grandTotal: order.grandTotal,
          isMultiMerchant: order.isMultiMerchant,
          merchantCount: order.merchantCount,
          overallStatus: order.overallStatus,
          subOrders: order.subOrders.map(sub => ({
            subOrderId: sub.subOrderId,
            merchant: sub.merchant,
            total: sub.total,
            status: sub.status
          }))
        }
      }, 'Order created successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to create order');
  }
});

/**
 * Get customer's orders
 */
export const getCustomerOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, status } = req.query;

  try {
    const filter = { user: userId };
    if (status) {
      filter.overallStatus = status;
    }

    const orders = await MultiMerchantOrder.find(filter)
      .populate('subOrders.merchant', 'name email')
      .populate('subOrders.items.product', 'name images price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const totalOrders = await MultiMerchantOrder.countDocuments(filter);

    return res.status(200).json(
      new apiResponse(200, {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNextPage: page < Math.ceil(totalOrders / limit),
          hasPrevPage: page > 1
        }
      }, 'Orders retrieved successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to get orders');
  }
});

/**
 * Get specific order details for customer
 */
export const getOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  try {
    const order = await MultiMerchantOrderService.getCustomerOrderDetails(orderId, userId);

    return res.status(200).json(
      new apiResponse(200, order, 'Order details retrieved successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to get order details');
  }
});

/**
 * Track order status (customer view)
 */
export const trackOrder = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;
  const userId = req.user.id;

  try {
    const order = await MultiMerchantOrder.findOne({ 
      orderNumber, 
      user: userId 
    })
    .populate('subOrders.merchant', 'name email')
    .populate('subOrders.items.product', 'name images')
    .lean();

    if (!order) {
      throw new apiError(404, 'Order not found');
    }

    // Create tracking summary
    const trackingInfo = {
      orderNumber: order.orderNumber,
      overallStatus: order.overallStatus,
      createdAt: order.createdAt,
      expectedDeliveryDate: order.expectedDeliveryDate,
      subOrderTracking: order.subOrders.map(sub => ({
        subOrderId: sub.subOrderId,
        merchant: sub.merchant,
        status: sub.status,
        trackingNumber: sub.trackingNumber,
        shippingCarrier: sub.shippingCarrier,
        estimatedDelivery: sub.estimatedDelivery,
        statusHistory: sub.statusHistory,
        items: sub.items
      }))
    };

    return res.status(200).json(
      new apiResponse(200, trackingInfo, 'Order tracking information retrieved successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to track order');
  }
});

// ==================== MERCHANT CONTROLLERS ====================

/**
 * Get orders for a specific merchant
 */
export const getMerchantOrders = asyncHandler(async (req, res) => {
  const merchantId = req.user.merchant || req.params.merchantId;
  const filters = req.query;

  if (!merchantId) {
    throw new apiError(400, 'Merchant ID is required');
  }

  try {
    const result = await MultiMerchantOrderService.getMerchantOrders(merchantId, filters);

    return res.status(200).json(
      new apiResponse(200, result, 'Merchant orders retrieved successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to get merchant orders');
  }
});

/**
 * Update sub-order status (merchant action)
 */
export const updateSubOrderStatus = asyncHandler(async (req, res) => {
  const { orderId, subOrderId } = req.params;
  const { status, notes = '' } = req.body;
  const merchantUserId = req.user.id;

  try {
    // Verify merchant has access to this sub-order
    const order = await MultiMerchantOrder.findById(orderId);
    if (!order) {
      throw new apiError(404, 'Order not found');
    }

    const subOrder = order.subOrders.find(sub => sub.subOrderId === subOrderId);
    if (!subOrder) {
      throw new apiError(404, 'Sub-order not found');
    }

    // Check if the merchant owns this sub-order
    if (subOrder.merchant.toString() !== req.user.merchant?.toString()) {
      throw new apiError(403, 'You can only update your own orders');
    }

    const updatedOrder = await MultiMerchantOrderService.updateSubOrderStatus(
      orderId, 
      subOrderId, 
      status, 
      merchantUserId, 
      notes
    );

    return res.status(200).json(
      new apiResponse(200, {
        orderNumber: updatedOrder.orderNumber,
        subOrderId,
        newStatus: status,
        overallStatus: updatedOrder.overallStatus
      }, 'Sub-order status updated successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to update sub-order status');
  }
});

/**
 * Add tracking information to sub-order
 */
export const addTrackingInfo = asyncHandler(async (req, res) => {
  const { orderId, subOrderId } = req.params;
  const trackingData = req.body;

  try {
    // Verify merchant has access to this sub-order
    const order = await MultiMerchantOrder.findById(orderId);
    if (!order) {
      throw new apiError(404, 'Order not found');
    }

    const subOrder = order.subOrders.find(sub => sub.subOrderId === subOrderId);
    if (!subOrder) {
      throw new apiError(404, 'Sub-order not found');
    }

    // Check if the merchant owns this sub-order
    if (subOrder.merchant.toString() !== req.user.merchant?.toString()) {
      throw new apiError(403, 'You can only update your own orders');
    }

    const updatedOrder = await MultiMerchantOrderService.addTrackingInfo(
      orderId, 
      subOrderId, 
      trackingData
    );

    return res.status(200).json(
      new apiResponse(200, {
        orderNumber: updatedOrder.orderNumber,
        subOrderId,
        trackingNumber: trackingData.trackingNumber,
        shippingCarrier: trackingData.shippingCarrier
      }, 'Tracking information added successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to add tracking information');
  }
});

/**
 * Get merchant's order statistics
 */
export const getMerchantOrderStats = asyncHandler(async (req, res) => {
  const merchantId = req.user.merchant || req.params.merchantId;
  const { timeRange = '30d' } = req.query;

  if (!merchantId) {
    throw new apiError(400, 'Merchant ID is required');
  }

  try {
    // Calculate date range
    const now = new Date();
    let daysBack = 30;
    
    switch (timeRange) {
      case '7d': daysBack = 7; break;
      case '30d': daysBack = 30; break;
      case '90d': daysBack = 90; break;
      default: daysBack = 30;
    }
    
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const stats = await MultiMerchantOrder.aggregate([
      {
        $match: {
          'subOrders.merchant': merchantId,
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: '$subOrders' },
      {
        $match: {
          'subOrders.merchant': merchantId
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$subOrders.total' },
          pendingOrders: {
            $sum: {
              $cond: [{ $eq: ['$subOrders.status', 'pending'] }, 1, 0]
            }
          },
          shippedOrders: {
            $sum: {
              $cond: [{ $eq: ['$subOrders.status', 'shipped'] }, 1, 0]
            }
          },
          deliveredOrders: {
            $sum: {
              $cond: [{ $eq: ['$subOrders.status', 'delivered'] }, 1, 0]
            }
          },
          averageOrderValue: { $avg: '$subOrders.total' }
        }
      }
    ]);

    const merchantStats = stats[0] || {
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      averageOrderValue: 0
    };

    return res.status(200).json(
      new apiResponse(200, {
        ...merchantStats,
        timeRange,
        periodStart: startDate,
        periodEnd: now
      }, 'Merchant order statistics retrieved successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to get merchant statistics');
  }
});

/**
 * Get merchant dashboard summary
 */
export const getMerchantDashboard = asyncHandler(async (req, res) => {
  const merchantId = req.user.merchant || req.params.merchantId;

  if (!merchantId) {
    throw new apiError(400, 'Merchant ID is required');
  }

  try {
    // Get recent orders
    const recentOrders = await MultiMerchantOrderService.getMerchantOrders(merchantId, {
      limit: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    // Get orders requiring attention
    const pendingOrders = await MultiMerchantOrderService.getMerchantOrders(merchantId, {
      status: 'pending',
      limit: 10
    });

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStats = await MultiMerchantOrder.aggregate([
      {
        $match: {
          'subOrders.merchant': merchantId,
          createdAt: { $gte: today }
        }
      },
      { $unwind: '$subOrders' },
      {
        $match: {
          'subOrders.merchant': merchantId
        }
      },
      {
        $group: {
          _id: null,
          todayOrders: { $sum: 1 },
          todayRevenue: { $sum: '$subOrders.total' }
        }
      }
    ]);

    const dashboard = {
      recentOrders: recentOrders.orders,
      pendingOrders: pendingOrders.orders,
      todayStats: todayStats[0] || { todayOrders: 0, todayRevenue: 0 },
      alerts: {
        pendingOrderCount: pendingOrders.pagination.totalOrders,
        lowStockItems: [], // You can implement this based on your inventory system
        shippingDelays: []  // You can implement this based on your shipping tracking
      }
    };

    return res.status(200).json(
      new apiResponse(200, dashboard, 'Merchant dashboard data retrieved successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to get merchant dashboard');
  }
});

// ==================== ADMIN CONTROLLERS ====================

/**
 * Get all orders (admin view)
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, merchantId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  try {
    const filter = {};
    if (status) filter.overallStatus = status;
    if (merchantId) filter['subOrders.merchant'] = merchantId;

    const orders = await MultiMerchantOrder.find(filter)
      .populate('user', 'fullname email')
      .populate('subOrders.merchant', 'name email')
      .populate('subOrders.items.product', 'name price')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalOrders = await MultiMerchantOrder.countDocuments(filter);

    return res.status(200).json(
      new apiResponse(200, {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / limit),
          totalOrders,
          hasNextPage: page < Math.ceil(totalOrders / limit),
          hasPrevPage: page > 1
        }
      }, 'All orders retrieved successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to get all orders');
  }
});

/**
 * Get order analytics for admin
 */
export const getOrderAnalytics = asyncHandler(async (req, res) => {
  const { timeRange = '30d' } = req.query;

  try {
    // Calculate date range
    const now = new Date();
    let daysBack = 30;
    
    switch (timeRange) {
      case '7d': daysBack = 7; break;
      case '30d': daysBack = 30; break;
      case '90d': daysBack = 90; break;
      default: daysBack = 30;
    }
    
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const analytics = await MultiMerchantOrder.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $facet: {
          orderStats: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$grandTotal' },
                averageOrderValue: { $avg: '$grandTotal' },
                multiMerchantOrders: {
                  $sum: {
                    $cond: ['$isMultiMerchant', 1, 0]
                  }
                }
              }
            }
          ],
          statusBreakdown: [
            {
              $group: {
                _id: '$overallStatus',
                count: { $sum: 1 },
                revenue: { $sum: '$grandTotal' }
              }
            }
          ],
          merchantBreakdown: [
            { $unwind: '$subOrders' },
            {
              $group: {
                _id: '$subOrders.merchant',
                orderCount: { $sum: 1 },
                revenue: { $sum: '$subOrders.total' }
              }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
          ]
        }
      }
    ]);

    return res.status(200).json(
      new apiResponse(200, {
        ...analytics[0],
        timeRange,
        periodStart: startDate,
        periodEnd: now
      }, 'Order analytics retrieved successfully')
    );
  } catch (error) {
    throw new apiError(500, error.message || 'Failed to get order analytics');
  }
});
