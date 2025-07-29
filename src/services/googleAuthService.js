import { OAuth2Client } from 'google-auth-library';
import { apiError } from '../utils/apiError.js';
import { User } from '../Models/userModels/user.models.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class GoogleAuthService {
  /**
   * Verify Google ID token
   */
  static async verifyIdToken(idToken) {
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      return payload;
    } catch (error) {
      throw new apiError(401, 'Invalid Google ID token');
    }
  }

  /**
   * Login or register user using Google ID token
   */
  static async loginOrRegister(idToken) {
    const payload = await this.verifyIdToken(idToken);

    // Check if user exists
    let user = await User.findOne({ email: payload.email });

    // If user doesn't exist, create a new user
    if (!user) {
      user = new User({
        fullname: payload.name,
        email: payload.email,
        avatar: payload.picture,
        isActive: true,
        role: 'customer',
        emailVerification: {
          isVerified: true,
        },
      });
      await user.save();
    }

    // Generate access token
    const accessToken = user.generateAccessToken();
    return { user, accessToken };
  }
}
