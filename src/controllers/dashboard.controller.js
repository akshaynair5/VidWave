import { Video } from "../models/video.model";
import ApiError from "../utils/apiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const getChannelStats = asyncHandler(async (req,res)=>{
    const stats = await Video.aggregate([
        { 
            $match: { owner: req.user._id } 
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscriptions"
            }
        },
        {
            $group: {
                _id: "$owner",
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$likes" } },
                totalSubscriptions: { $sum: {$size: "$subscriptions"}}
            }
        },
        {
            $project: {
                _id: 0,
                totalViews: 1,
                totalLikes: 1,
                totalSubscriptions: 1
            }
        }
    ]);

    if(stats.length === 0){
        throw new ApiError(500, "Could not fetch Stats")
    }

    res.status(200).json(new ApiResponse(200,stats,"Data has been fetched successfully"))

})

const getChannelVideos = asyncHandler(async (req,res) => {
    const videos = await Video.find({owner: req.user._id})

    if(videos.length === 0){
        throw new ApiError(400, "No videos found for the channel")
    }

    res.send(new ApiResponse(200,videos,"User videos has been fetched successfully"))

})

export { getChannelStats, getChannelVideos}