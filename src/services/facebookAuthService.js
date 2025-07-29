import axios from 'axios';
import { apiError } from '../utils/apiError.js';
import { User } from '../Models/userModels/user.models.js';

export class FacebookAuthService {
  /**
   * Verify Facebook access token and get user data
   */
  static async verifyAccessToken(accessToken) {
    try {
      // Verify token with Facebook Graph API
      const verifyResponse = await axios.get(
        `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`
      );

      if (!verifyResponse.data.data.is_valid) {
        throw new apiError(401, 'Invalid Facebook access token');
      }

      // Get user profile data
      const userResponse = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
      );

      return userResponse.data;
    } catch (error) {
      if (error instanceof apiError) throw error;
      throw new apiError(401, 'Failed to verify Facebook token');
    }
  }

  /**
   * Login or register user using Facebook access token
   */
  static async loginOrRegister(accessToken) {
    const facebookUser = await this.verifyAccessToken(accessToken);

    if (!facebookUser.email) {
      throw new apiError(400, 'Email permission is required for Facebook login');
    }

    // Check if user exists
    let user = await User.findOne({ email: facebookUser.email });

    // If user doesn't exist, create a new user
    if (!user) {
      user = new User({
        fullname: facebookUser.name,
        email: facebookUser.email,
        avatar: facebookUser.picture?.data?.url,
        isActive: true,
        role: 'customer',
        emailVerification: {
          isVerified: true,
        },
        socialProviders: {
          facebook: {
            id: facebookUser.id,
            connected: true,
            connectedAt: new Date()
          }
        }
      });
      await user.save();
    } else {
      // Update Facebook connection info if user exists
      if (!user.socialProviders) {
        user.socialProviders = {};
      }
      
      user.socialProviders.facebook = {
        id: facebookUser.id,
        connected: true,
        connectedAt: new Date()
      };
      await user.save();
    }

    // Generate access token
    const authToken = user.generateAccessToken();
    return { user, accessToken: authToken };
  }

  /**
   * Disconnect Facebook account
   */
  static async disconnectAccount(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new apiError(404, 'User not found');
      }

      if (user.socialProviders?.facebook) {
        user.socialProviders.facebook.connected = false;
        user.socialProviders.facebook.disconnectedAt = new Date();
        await user.save();
      }

      return { success: true, message: 'Facebook account disconnected' };
    } catch (error) {
      throw new apiError(400, 'Failed to disconnect Facebook account');
    }
  }
}
