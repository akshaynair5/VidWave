import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

// This has been placed in different file as there may be situations in which we might need to check whether the use is authenticated or not.
// As res here is not essentially used we can replace it with _ to indicate that it is not used.
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies.accessToken || req.header("Authorization").replace("Bearer ", "");
        if(!token){
            throw new ApiError(401,"Unauthorized Request");
        }
    
        const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    
        if(!user){
            // Something to remember here is that we should not send any error message to the client as it can be used to brute force the system.
            // Instead, we should return a generic error message and log the error in the server logs.
            throw new ApiError(401,"Invalid Access Token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})