import Stripe from 'stripe';
import { apiError } from '../utils/apiError.js';

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export class StripeService {
  /**
   * Create a payment intent for one-time payments
   */
  static async createPaymentIntent({
    amount,
    currency = 'usd',
    customerId,
    metadata = {},
    description = 'Clothing purchase'
  }) {
    try {
      const paymentIntentData = {
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        description,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      };

      if (customerId) {
        paymentIntentData.customer = customerId;
      }

      const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
      
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      };
    } catch (error) {
      throw new apiError(400, `Stripe payment intent creation failed: ${error.message}`);
    }
  }

  /**
   * Create a Stripe customer
   */
  static async createCustomer({ email, name, phone, address }) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        phone,
        address,
        metadata: {
          source: 'clothing_backend'
        }
      });

      return {
        customerId: customer.id,
        email: customer.email,
        name: customer.name
      };
    } catch (error) {
      throw new apiError(400, `Stripe customer creation failed: ${error.message}`);
    }
  }

  /**
   * Retrieve payment intent details
   */
  static async retrievePaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        description: paymentIntent.description,
        metadata: paymentIntent.metadata
      };
    } catch (error) {
      throw new apiError(400, `Failed to retrieve payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm a payment intent
   */
  static async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId
      });

      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
      };
    } catch (error) {
      throw new apiError(400, `Payment confirmation failed: ${error.message}`);
    }
  }

  /**
   * Create a refund
   */
  static async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
        reason
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundData);

      return {
        refundId: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason
      };
    } catch (error) {
      throw new apiError(400, `Refund creation failed: ${error.message}`);
    }
  }

  /**
   * Create a subscription for recurring payments
   */
  static async createSubscription(customerId, priceId, metadata = {}) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      });

      return {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status
      };
    } catch (error) {
      throw new apiError(400, `Subscription creation failed: ${error.message}`);
    }
  }

  /**
   * Handle webhook events
   */
  static async handleWebhook(payload, signature, endpointSecret) {
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
      
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('Payment succeeded:', event.data.object.id);
          break;
        case 'payment_intent.payment_failed':
          console.log('Payment failed:', event.data.object.id);
          break;
        case 'customer.subscription.created':
          console.log('Subscription created:', event.data.object.id);
          break;
        case 'customer.subscription.updated':
          console.log('Subscription updated:', event.data.object.id);
          break;
        case 'invoice.payment_succeeded':
          console.log('Invoice payment succeeded:', event.data.object.id);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return event;
    } catch (error) {
      throw new apiError(400, `Webhook signature verification failed: ${error.message}`);
    }
  }

  /**
   * Get payment methods for a customer
   */
  static async getCustomerPaymentMethods(customerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });

      return paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year
      }));
    } catch (error) {
      throw new apiError(400, `Failed to retrieve payment methods: ${error.message}`);
    }
  }

  /**
   * Create a setup intent for saving payment methods
   */
  static async createSetupIntent(customerId) {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session'
      });

      return {
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id
      };
    } catch (error) {
      throw new apiError(400, `Setup intent creation failed: ${error.message}`);
    }
  }
}
