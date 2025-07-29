import axios from 'axios';
import { apiError } from '../utils/apiError.js';

const UPS_API_URL = 'https://onlinetools.ups.com';

export class UPSService {
  constructor() {
    this.apiKey = process.env.UPS_API_KEY;
    this.username = process.env.UPS_USERNAME;
    this.password = process.env.UPS_PASSWORD;
  }

  /**
   * Get authentication headers for UPS API
   */
  static getAuthHeaders() {
    return {
      'AccessLicenseNumber': process.env.UPS_ACCESS_KEY,
      'Username': process.env.UPS_USERNAME,
      'Password': process.env.UPS_PASSWORD,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get shipping rates from UPS
   */
  static async getRates({ 
    shipFrom, 
    shipTo, 
    packages, 
    serviceCode = '03' // Ground service by default
  }) {
    try {
      const requestData = {
        UPSSecurity: {
          UsernameToken: {
            Username: process.env.UPS_USERNAME,
            Password: process.env.UPS_PASSWORD
          },
          ServiceAccessToken: {
            AccessLicenseNumber: process.env.UPS_ACCESS_KEY
          }
        },
        RateRequest: {
          Request: {
            RequestOption: 'Rate',
            TransactionReference: {
              CustomerContext: 'Rate Request'
            }
          },
          Shipment: {
            Shipper: {
              Name: shipFrom.name,
              Address: {
                AddressLine: shipFrom.addressLine,
                City: shipFrom.city,
                StateProvinceCode: shipFrom.stateCode,
                PostalCode: shipFrom.postalCode,
                CountryCode: shipFrom.countryCode
              }
            },
            ShipTo: {
              Name: shipTo.name,
              Address: {
                AddressLine: shipTo.addressLine,
                City: shipTo.city,
                StateProvinceCode: shipTo.stateCode,
                PostalCode: shipTo.postalCode,
                CountryCode: shipTo.countryCode
              }
            },
            Service: {
              Code: serviceCode
            },
            Package: packages.map(pkg => ({
              PackagingType: {
                Code: '02' // Customer Supplied Package
              },
              Dimensions: {
                UnitOfMeasurement: {
                  Code: 'IN'
                },
                Length: pkg.length,
                Width: pkg.width,
                Height: pkg.height
              },
              PackageWeight: {
                UnitOfMeasurement: {
                  Code: 'LBS'
                },
                Weight: pkg.weight
              }
            }))
          }
        }
      };

      const response = await axios.post(
        `${UPS_API_URL}/rest/Rate`,
        requestData,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        rates: response.data.RateResponse?.RatedShipment || [],
        totalCharges: response.data.RateResponse?.RatedShipment?.[0]?.TotalCharges
      };
    } catch (error) {
      throw new apiError(400, `Failed to get UPS rates: ${error.message}`);
    }
  }

  /**
   * Track a UPS package
   */
  static async trackPackage(trackingNumber) {
    try {
      const requestData = {
        UPSSecurity: {
          UsernameToken: {
            Username: process.env.UPS_USERNAME,
            Password: process.env.UPS_PASSWORD
          },
          ServiceAccessToken: {
            AccessLicenseNumber: process.env.UPS_ACCESS_KEY
          }
        },
        TrackRequest: {
          Request: {
            RequestOption: '1',
            TransactionReference: {
              CustomerContext: 'Track Request'
            }
          },
          InquiryNumber: trackingNumber
        }
      };

      const response = await axios.post(
        `${UPS_API_URL}/rest/Track`,
        requestData,
        { headers: this.getAuthHeaders() }
      );

      const shipment = response.data.TrackResponse?.Shipment;
      
      return {
        trackingNumber,
        status: shipment?.Package?.Activity?.[0]?.Status?.Description,
        location: shipment?.Package?.Activity?.[0]?.ActivityLocation?.Address,
        activities: shipment?.Package?.Activity || [],
        deliveryDate: shipment?.Package?.DeliveryDate,
        estimatedDelivery: shipment?.Package?.RescheduledDeliveryDate
      };
    } catch (error) {
      throw new apiError(400, `Failed to track UPS package: ${error.message}`);
    }
  }

  /**
   * Validate an address using UPS API
   */
  static async validateAddress(address) {
    try {
      const requestData = {
        UPSSecurity: {
          UsernameToken: {
            Username: process.env.UPS_USERNAME,
            Password: process.env.UPS_PASSWORD
          },
          ServiceAccessToken: {
            AccessLicenseNumber: process.env.UPS_ACCESS_KEY
          }
        },
        XAVRequest: {
          Request: {
            RequestOption: '1',
            TransactionReference: {
              CustomerContext: 'Address Validation'
            }
          },
          AddressKeyFormat: {
            AddressLine: address.addressLine,
            PoliticalDivision2: address.city,
            PoliticalDivision1: address.stateCode,
            PostcodePrimaryLow: address.postalCode,
            CountryCode: address.countryCode
          }
        }
      };

      const response = await axios.post(
        `${UPS_API_URL}/rest/XAV`,
        requestData,
        { headers: this.getAuthHeaders() }
      );

      const validAddress = response.data.XAVResponse?.ValidAddressIndicator;
      const suggestions = response.data.XAVResponse?.Candidate || [];

      return {
        isValid: !!validAddress,
        suggestions: suggestions.map(candidate => ({
          addressLine: candidate.AddressKeyFormat?.AddressLine,
          city: candidate.AddressKeyFormat?.PoliticalDivision2,
          state: candidate.AddressKeyFormat?.PoliticalDivision1,
          postalCode: candidate.AddressKeyFormat?.PostcodePrimaryLow,
          quality: candidate.AddressKeyFormat?.Quality
        }))
      };
    } catch (error) {
      throw new apiError(400, `Failed to validate address: ${error.message}`);
    }
  }

  /**
   * Create a shipment label
   */
  static async createShipmentLabel(shipmentData) {
    try {
      const requestData = {
        UPSSecurity: {
          UsernameToken: {
            Username: process.env.UPS_USERNAME,
            Password: process.env.UPS_PASSWORD
          },
          ServiceAccessToken: {
            AccessLicenseNumber: process.env.UPS_ACCESS_KEY
          }
        },
        ShipmentRequest: {
          Request: {
            RequestOption: 'nonvalidate',
            TransactionReference: {
              CustomerContext: 'Ship Request'
            }
          },
          Shipment: shipmentData,
          LabelSpecification: {
            LabelImageFormat: {
              Code: 'PDF'
            },
            HTTPUserAgent: 'Mozilla/4.5'
          }
        }
      };

      const response = await axios.post(
        `${UPS_API_URL}/rest/Ship`,
        requestData,
        { headers: this.getAuthHeaders() }
      );

      return {
        trackingNumber: response.data.ShipmentResponse?.ShipmentResults?.PackageResults?.TrackingNumber,
        labelImage: response.data.ShipmentResponse?.ShipmentResults?.PackageResults?.ShippingLabel?.GraphicImage,
        shipmentCost: response.data.ShipmentResponse?.ShipmentResults?.ShipmentCharges?.TotalCharges
      };
    } catch (error) {
      throw new apiError(400, `Failed to create UPS shipment: ${error.message}`);
    }
  }
}
