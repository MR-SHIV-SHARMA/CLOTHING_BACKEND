import { MultiMerchantOrder } from '../Models/orderModels/multiMerchantOrder.models.js';
import { Product } from '../Models/adminmodels/product.models.js';
import { Cart } from '../Models/orderModels/cart.models.js';
import { StripeService } from './stripeService.js';
import { apiError } from '../utils/apiError.js';
import crypto from 'crypto';

export class MultiMerchantOrderService {
  /**
   * Create a multi-merchant order from cart items
   */
  static async createOrderFromCart(userId, orderData) {
    const { shippingAddress, billingAddress, paymentMethod, customerNotes, specialInstructions } = orderData;

    try {
      // Get cart items
      const cart = await Cart.findOne({ user: userId }).populate({
        path: 'items.product',
        populate: {
          path: 'merchant',
          select: 'name email businessAddress'
        }
      });

      if (!cart || cart.items.length === 0) {
        throw new apiError(400, 'Cart is empty');
      }

      // Group cart items by merchant
      const merchantGroups = this.groupItemsByMerchant(cart.items);

      // Calculate totals
      const { subtotal, totalShipping, totalTax, grandTotal } = this.calculateOrderTotals(merchantGroups);

      // Create sub-orders for each merchant
      const subOrders = [];
      for (const [merchantId, items] of Object.entries(merchantGroups)) {
        const subOrderId = this.generateSubOrderId();
        const subOrderTotal = items.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);
        
        const subOrder = {
          subOrderId,
          merchant: merchantId,
          items: items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price,
            size: item.size,
            color: item.color,
            productTotal: item.quantity * item.product.price
          })),
          subtotal: subOrderTotal,
          shippingCost: this.calculateShippingCost(items, shippingAddress),
          tax: this.calculateTax(subOrderTotal, shippingAddress),
          total: subOrderTotal,
          status: 'pending',
          statusHistory: [{
            status: 'pending',
            timestamp: new Date(),
            updatedByType: 'customer',
            notes: 'Order placed by customer'
          }]
        };

        subOrders.push(subOrder);
      }

      // Create the main order
      const newOrder = new MultiMerchantOrder({
        user: userId,
        subOrders,
        subtotal,
        totalShipping,
        totalTax,
        grandTotal,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        paymentMethod,
        customerNotes,
        specialInstructions,
        statusHistory: [{
          status: 'pending',
          timestamp: new Date(),
          notes: 'Order created from cart'
        }]
      });

      await newOrder.save();

      // Clear the cart after successful order creation
      await Cart.findOneAndUpdate({ user: userId }, { items: [] });

      // Send notifications to merchants
      await this.notifyMerchants(newOrder);

      return newOrder;

    } catch (error) {
      throw new apiError(500, `Failed to create order: ${error.message}`);
    }
  }

  /**
   * Group cart items by merchant
   */
  static groupItemsByMerchant(cartItems) {
    const merchantGroups = {};

    cartItems.forEach(item => {
      const merchantId = item.product.merchant._id.toString();
      
      if (!merchantGroups[merchantId]) {
        merchantGroups[merchantId] = [];
      }
      
      merchantGroups[merchantId].push(item);
    });

    return merchantGroups;
  }

  /**
   * Calculate order totals
   */
  static calculateOrderTotals(merchantGroups) {
    let subtotal = 0;
    let totalShipping = 0;
    let totalTax = 0;

    Object.values(merchantGroups).forEach(items => {
      const merchantSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.product.price), 0);
      subtotal += merchantSubtotal;
      
      // Calculate shipping per merchant (simplified - you might want more complex logic)
      totalShipping += this.calculateShippingCost(items);
      totalTax += this.calculateTax(merchantSubtotal);
    });

    const grandTotal = subtotal + totalShipping + totalTax;

    return { subtotal, totalShipping, totalTax, grandTotal };
  }

  /**
   * Calculate shipping cost (simplified)
   */
  static calculateShippingCost(items, address = null) {
    // Simplified shipping calculation
    // In real implementation, integrate with shipping providers
    const baseShipping = 5.99;
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    if (itemCount > 5) {
      return baseShipping + (itemCount - 5) * 1.50;
    }
    
    return baseShipping;
  }

  /**
   * Calculate tax (simplified)
   */
  static calculateTax(subtotal, address = null) {
    // Simplified tax calculation - 8.5% rate
    // In real implementation, use tax calculation service based on address
    const taxRate = 0.085;
    return subtotal * taxRate;
  }

  /**
   * Generate unique sub-order ID
   */
  static generateSubOrderId() {
    const timestamp = Date.now().toString();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `SUB-${timestamp.slice(-6)}-${random}`;
  }

  /**
   * Update sub-order status (for merchants)
   */
  static async updateSubOrderStatus(orderId, subOrderId, newStatus, updatedBy, notes = '') {
    try {
      const order = await MultiMerchantOrder.findById(orderId);
      if (!order) {
        throw new apiError(404, 'Order not found');
      }

      const subOrder = order.subOrders.find(sub => sub.subOrderId === subOrderId);
      if (!subOrder) {
        throw new apiError(404, 'Sub-order not found');
      }

      // Update sub-order status
      subOrder.status = newStatus;
      subOrder.statusHistory.push({
        status: newStatus,
        timestamp: new Date(),
        updatedBy,
        updatedByType: 'merchant',
        notes
      });

      // Add specific timestamps based on status
      switch (newStatus) {
        case 'confirmed':
          // Merchant confirmed the order
          break;
        case 'processing':
          // Order is being prepared
          break;
        case 'shipped':
          subOrder.shippedAt = new Date();
          break;
        case 'delivered':
          subOrder.deliveredAt = new Date();
          break;
      }

      // Update overall order status
      await order.updateOverallStatus();

      return order;

    } catch (error) {
      throw new apiError(500, `Failed to update sub-order status: ${error.message}`);
    }
  }

  /**
   * Get orders for a specific merchant
   */
  static async getMerchantOrders(merchantId, filters = {}) {
    const { status, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = filters;

    try {
      let matchStage = {
        'subOrders.merchant': merchantId
      };

      if (status) {
        matchStage['subOrders.status'] = status;
      }

      const aggregationPipeline = [
        { $match: matchStage },
        { $unwind: '$subOrders' },
        { $match: { 'subOrders.merchant': merchantId } },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'customer'
          }
        },
        { $unwind: '$customer' },
        {
          $lookup: {
            from: 'products',
            localField: 'subOrders.items.product',
            foreignField: '_id',
            as: 'products'
          }
        },
        {
          $project: {
            orderNumber: 1,
            subOrderId: '$subOrders.subOrderId',
            items: '$subOrders.items',
            subtotal: '$subOrders.subtotal',
            shippingCost: '$subOrders.shippingCost',
            tax: '$subOrders.tax',
            total: '$subOrders.total',
            status: '$subOrders.status',
            trackingNumber: '$subOrders.trackingNumber',
            shippingMethod: '$subOrders.shippingMethod',
            estimatedDelivery: '$subOrders.estimatedDelivery',
            merchantNotes: '$subOrders.merchantNotes',
            statusHistory: '$subOrders.statusHistory',
            customer: {
              fullname: '$customer.fullname',
              email: '$customer.email'
            },
            shippingAddress: 1,
            createdAt: 1,
            products: 1
          }
        },
        { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) }
      ];

      const orders = await MultiMerchantOrder.aggregate(aggregationPipeline);
      
      // Get total count for pagination
      const totalCountPipeline = [
        { $match: matchStage },
        { $unwind: '$subOrders' },
        { $match: { 'subOrders.merchant': merchantId } },
        { $count: 'total' }
      ];
      
      const totalCountResult = await MultiMerchantOrder.aggregate(totalCountPipeline);
      const totalCount = totalCountResult[0]?.total || 0;

      return {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalOrders: totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPrevPage: page > 1
        }
      };

    } catch (error) {
      throw new apiError(500, `Failed to get merchant orders: ${error.message}`);
    }
  }

  /**
   * Notify merchants about new orders
   */
  static async notifyMerchants(order) {
    // Implementation for sending notifications to merchants
    // This could be email, SMS, push notifications, etc.
    
    for (const subOrder of order.subOrders) {
      // Send email notification to merchant
      console.log(`Notifying merchant ${subOrder.merchant} about new order ${subOrder.subOrderId}`);
      
      // You can integrate with email service here
      // await emailService.sendMerchantOrderNotification(subOrder.merchant, order, subOrder);
    }
  }

  /**
   * Add tracking information to sub-order
   */
  static async addTrackingInfo(orderId, subOrderId, trackingData) {
    const { trackingNumber, shippingCarrier, shippingMethod, estimatedDelivery } = trackingData;

    try {
      const order = await MultiMerchantOrder.findById(orderId);
      if (!order) {
        throw new apiError(404, 'Order not found');
      }

      const subOrder = order.subOrders.find(sub => sub.subOrderId === subOrderId);
      if (!subOrder) {
        throw new apiError(404, 'Sub-order not found');
      }

      subOrder.trackingNumber = trackingNumber;
      subOrder.shippingCarrier = shippingCarrier;
      subOrder.shippingMethod = shippingMethod;
      subOrder.estimatedDelivery = estimatedDelivery;
      subOrder.status = 'shipped';
      subOrder.shippedAt = new Date();

      subOrder.statusHistory.push({
        status: 'shipped',
        timestamp: new Date(),
        updatedByType: 'merchant',
        notes: `Shipped via ${shippingCarrier}, tracking: ${trackingNumber}`
      });

      await order.save();
      await order.updateOverallStatus();

      return order;

    } catch (error) {
      throw new apiError(500, `Failed to add tracking info: ${error.message}`);
    }
  }

  /**
   * Get order details for customer
   */
  static async getCustomerOrderDetails(orderId, userId) {
    try {
      const order = await MultiMerchantOrder.findOne({ _id: orderId, user: userId })
        .populate('subOrders.merchant', 'name email businessAddress')
        .populate('subOrders.items.product', 'name images price')
        .populate('user', 'fullname email');

      if (!order) {
        throw new apiError(404, 'Order not found');
      }

      return order;

    } catch (error) {
      throw new apiError(500, `Failed to get order details: ${error.message}`);
    }
  }
}
