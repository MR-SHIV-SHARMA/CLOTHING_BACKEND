import axios from 'axios';
import { apiError } from '../utils/apiError.js';

const FEDEX_API_URL = 'https://apis.fedex.com';

export class FedExService {
  /**
   * Get shipping rates
   */
  static async getRates({ origin, destination, packages }) {
    try {
      const response = await axios.post(`${FEDEX_API_URL}/rate/v1/rates/quotes`, {
        origin,
        destination,
        packages,
      }, {
        headers: {
          Authorization: `Bearer ${process.env.FEDEX_API_KEY}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new apiError(400, `Failed to get FedEx rates: ${error.message}`);
    }
  }

  /**
   * Track a package
   */
  static async trackPackage(trackingNumber) {
    try {
      const response = await axios.get(`${FEDEX_API_URL}/track/v1/trackingnumbers/${trackingNumber}`, {
        headers: {
          Authorization: `Bearer ${process.env.FEDEX_API_KEY}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new apiError(400, `Failed to track FedEx package: ${error.message}`);
    }
  }

  /**
   * Schedule a pickup
   */
  static async schedulePickup(pickupRequest) {
    try {
      const response = await axios.post(`${FEDEX_API_URL}/pickup/v1/pickups`, pickupRequest, {
        headers: {
          Authorization: `Bearer ${process.env.FEDEX_API_KEY}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new apiError(400, `Failed to schedule FedEx pickup: ${error.message}`);
    }
  }
}

