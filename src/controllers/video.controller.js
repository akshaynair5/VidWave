import { Video } from "../models/video.model";
import ApiError from "../utils/apiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import deleteFromCloudinary from "../utils/fileDelete";
import uploadToCloudinary from "../utils/fileUpload";

const getAllVideos = asyncHandler(async (req,res)=>{
    const { page = 1, limit = 10, query, sortBy = "createAt", sortType = "desc", userId } = req.query

    if(!userId){
        throw new ApiError(400,"User ID is required")
    }

    // Initialize filter object
    const filter = {};
    
    // Add search query filter (partial match on title or description)
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }
        
    // Filter by user ID if provided
    if (userId) {
        filter.owner = userId;
    }
        
    // Convert sortType to -1 for descending or 1 for ascending
    const sortDirection = sortType === "desc" ? -1 : 1;
    const sortOptions = { [sortBy]: sortDirection };
        
    // Execute the query with pagination, sorting, and filtering
    const videos = await Video.find(filter)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
        
    // Get total count for pagination information
    const totalVideos = await Video.countDocuments(filter);
    const totalPages = Math.ceil(totalVideos / limit);

    res.json(new ApiResponse(200, "Videos retrieved successfully", { videos, totalPages, totalVideos }))

}) 

const publishVideo = asyncHandler(async (req,res)=>{
    const {title, description} = req.body
    const videoLocalPath = req.files?.video[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!title ||!description){
        throw new ApiError(400,"Title, Description and Video are required")
    }

    if(!videoLocalPath){
        throw new ApiError(400,"Video has not been uploaded locally")
    }

    const video = await uploadToCloudinary(videoLocalPath)
    if (!video.url) {
        throw new ApiError(500, "Failed to upload video to Cloudinary");
    }
    
    let thumbnail = { url: "" };  // Default if no thumbnail provided
    if (thumbnailLocalPath) {
        thumbnail = await uploadToCloudinary(thumbnailLocalPath);
    }

    if (!thumbnail.url) {
        throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
    }
    

    const newVideo = await Video.create({
        owner: req.user._id,
        title,
        description,
        videoFile: video.url,
        thumbnail: thumbnail.url || "",
        isPublished: true,
        duration: video.duration,
    })

    res.json(new ApiResponse(201, "Video published successfully", newVideo))

})

const getVideoById = asyncHandler(async (req,res)=>{
    const videoId = req.params.videoId
    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    res.json(new ApiResponse(200, "Video retrieved successfully", video))

})

const deleteVideo = asyncHandler(async (req,res)=>{
    const videoId = req.params.videoId
    const video = await Video.findByIdAndDelete(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    await deleteFromCloudinary(video.videoFile)

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    res.json(new ApiResponse(200, "Video deleted successfully", video))
})

const updateVideo = asyncHandler(async (req,res)=>{
    const {title, description} = req.body
    const videoId = req.params.videoId
    const video = await Video.findByIdAndUpdate(videoId, {title, description}, {new: true})

    if(!video){
        throw new ApiError(404,"Video not found")
    }

    res.json(new ApiResponse(200, "Video updated successfully", video))
})


export {getAllVideos ,publishVideo ,deleteVideo ,updateVideo ,getVideoById}