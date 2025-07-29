import { GoogleAuthService } from '../../services/googleAuthService.js';
import { FacebookAuthService } from '../../services/facebookAuthService.js';
import { User } from '../../Models/userModels/user.models.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { apiError } from '../../utils/apiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

/**
 * Google OAuth Login
 */
export const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new apiError(400, 'Google ID token is required');
  }

  try {
    const { user, accessToken } = await GoogleAuthService.loginOrRegister(idToken);

    // Set secure HTTP-only cookie
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };

    res.cookie('accessToken', accessToken, options);

    // Log security event
    user.securityLogs.push({
      action: 'login',
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    await user.save();

    return res.status(200).json(
      new apiResponse(200, {
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        },
        accessToken
      }, 'Google login successful')
    );
  } catch (error) {
    throw new apiError(401, error.message || 'Google login failed');
  }
});

/**
 * Facebook OAuth Login
 */
export const facebookLogin = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    throw new apiError(400, 'Facebook access token is required');
  }

  try {
    const { user, accessToken: authToken } = await FacebookAuthService.loginOrRegister(accessToken);

    // Set secure HTTP-only cookie
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    };

    res.cookie('accessToken', authToken, options);

    // Log security event
    user.securityLogs.push({
      action: 'login',
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      success: true
    });
    await user.save();

    return res.status(200).json(
      new apiResponse(200, {
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          avatar: user.avatar,
          role: user.role
        },
        accessToken: authToken
      }, 'Facebook login successful')
    );
  } catch (error) {
    throw new apiError(401, error.message || 'Facebook login failed');
  }
});

/**
 * Link Google account to existing user
 */
export const linkGoogleAccount = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const userId = req.user.id;

  if (!idToken) {
    throw new apiError(400, 'Google ID token is required');
  }

  try {
    const payload = await GoogleAuthService.verifyIdToken(idToken);
    
    // Update user with Google connection info
    const user = await User.findById(userId);
    if (!user) {
      throw new apiError(404, 'User not found');
    }

    if (!user.socialProviders) {
      user.socialProviders = {};
    }

    user.socialProviders.google = {
      id: payload.sub,
      connected: true,
      connectedAt: new Date()
    };
    
    await user.save();

    return res.status(200).json(
      new apiResponse(200, { 
        connected: true,
        provider: 'google' 
      }, 'Google account linked successfully')
    );
  } catch (error) {
    throw new apiError(400, error.message || 'Failed to link Google account');
  }
});

/**
 * Link Facebook account to existing user
 */
export const linkFacebookAccount = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;
  const userId = req.user.id;

  if (!accessToken) {
    throw new apiError(400, 'Facebook access token is required');
  }

  try {
    const facebookUser = await FacebookAuthService.verifyAccessToken(accessToken);
    
    // Update user with Facebook connection info
    const user = await User.findById(userId);
    if (!user) {
      throw new apiError(404, 'User not found');
    }

    if (!user.socialProviders) {
      user.socialProviders = {};
    }

    user.socialProviders.facebook = {
      id: facebookUser.id,
      connected: true,
      connectedAt: new Date()
    };
    
    await user.save();

    return res.status(200).json(
      new apiResponse(200, { 
        connected: true,
        provider: 'facebook' 
      }, 'Facebook account linked successfully')
    );
  } catch (error) {
    throw new apiError(400, error.message || 'Failed to link Facebook account');
  }
});

/**
 * Unlink social media account
 */
export const unlinkSocialAccount = asyncHandler(async (req, res) => {
  const { provider } = req.params;
  const userId = req.user.id;

  const validProviders = ['google', 'facebook', 'twitter'];
  if (!validProviders.includes(provider)) {
    throw new apiError(400, 'Invalid social provider');
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new apiError(404, 'User not found');
    }

    if (user.socialProviders && user.socialProviders[provider]) {
      user.socialProviders[provider].connected = false;
      user.socialProviders[provider].disconnectedAt = new Date();
      await user.save();
    }

    return res.status(200).json(
      new apiResponse(200, { 
        disconnected: true,
        provider 
      }, `${provider.charAt(0).toUpperCase() + provider.slice(1)} account unlinked successfully`)
    );
  } catch (error) {
    throw new apiError(400, error.message || 'Failed to unlink social account');
  }
});

/**
 * Get connected social accounts
 */
export const getConnectedAccounts = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).select('socialProviders');
    if (!user) {
      throw new apiError(404, 'User not found');
    }

    const connectedAccounts = {};
    
    if (user.socialProviders) {
      Object.keys(user.socialProviders).forEach(provider => {
        const providerData = user.socialProviders[provider];
        connectedAccounts[provider] = {
          connected: providerData.connected || false,
          connectedAt: providerData.connectedAt,
          disconnectedAt: providerData.disconnectedAt
        };
      });
    }

    return res.status(200).json(
      new apiResponse(200, connectedAccounts, 'Connected accounts retrieved successfully')
    );
  } catch (error) {
    throw new apiError(400, error.message || 'Failed to get connected accounts');
  }
});
