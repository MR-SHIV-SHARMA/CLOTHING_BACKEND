import crypto from 'crypto';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

/**
 * Two-Factor Authentication utility functions
 */

export class TwoFactorAuth {
  /**
   * Generate a secret key for 2FA
   */
  static generateSecret() {
    return authenticator.generateSecret();
  }

  /**
   * Generate QR code URL for authenticator apps
   */
  static generateQRCodeURL(email, secret, appName = 'Clothing Store') {
    const otpauth = authenticator.keyuri(email, appName, secret);
    return otpauth;
  }

  /**
   * Generate QR code image as data URL
   */
  static async generateQRCode(email, secret, appName = 'Clothing Store') {
    try {
      const otpauth = this.generateQRCodeURL(email, secret, appName);
      const qrCodeDataURL = await QRCode.toDataURL(otpauth);
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verify TOTP token
   */
  static verifyToken(token, secret) {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate backup codes
   */
  static generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Hash backup codes for storage
   */
  static hashBackupCodes(codes) {
    return codes.map(code => {
      return {
        code: crypto.createHash('sha256').update(code).digest('hex'),
        used: false
      };
    });
  }

  /**
   * Verify backup code
   */
  static verifyBackupCode(inputCode, hashedCodes) {
    const inputHash = crypto.createHash('sha256').update(inputCode.toUpperCase()).digest('hex');
    
    const codeIndex = hashedCodes.findIndex(
      item => item.code === inputHash && !item.used
    );
    
    if (codeIndex !== -1) {
      // Mark code as used
      hashedCodes[codeIndex].used = true;
      return true;
    }
    
    return false;
  }
}
