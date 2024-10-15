import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const checkHealth = asyncHandler(async (req,res)=>{
    res.status(200).json(new ApiResponse("Health Check", {message:"OK"}, "200"))
})

export { checkHealth }