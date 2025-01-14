import jwt from "jsonwebtoken";
import { apiError } from "../../utils/apiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../Models/user.models.js";

const authenticateAdmin = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return next(new apiError(401, "Access token is missing"));
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return next(new apiError(401, "Invalid token"));
    }

    req.user = user;
    req.admin = user;

    next();
  } catch (error) {
    return next(new apiError(401, "Invalid token"));
  }
});

export default authenticateAdmin;
