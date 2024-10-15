import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import ApiError from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createPlayList = asyncHandler(async (req, res)=>{
    const { name, description } = req.body;
    if(!name || !description){
        throw new ApiError(400, "Please provide name and description for the playlist");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    if(!playlist){
        throw new ApiError(500,"Playlist not created")
    }

    res.status(200).json(new ApiResponse(200,playlist,"Playlist created successfully"))

})

const getPlayList = asyncHandler(async (req,res)=>{
    const playListId = req.params.playListId;

    if(!playListId){
        throw new ApiError(400,"Please provide playListId")
    }

    const playList = await Playlist.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(playListId),
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videosList",
                foreignField: "_id",
                as: "videoList",
                
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner"
                        }, 
                        pipeline: [
                            {
                                $project: {
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1
                                }
                            }
                        ]
                    },
                    {
                        $addFields:{
                            $first: "$owner"
                        }
                    }
                ]
            }
        }
    ])

    res.status(200).json(new ApiResponse(200,playList,"Playlist fetched successfully"))
})

const updatePlayListDetails = asyncHandler(async (req,res)=>{
    const playListId = req.params.playListId;
    const name = req.body.name
    const description = req.body.description

    if(!playListId){
        throw new ApiError(400,"Please provide playListId")
    }

    if (!name && !description) {
        throw new ApiError(400, "Please provide name or description for the playlist");
    }
    
    const updateFields = {};  // Create an empty object to hold the fields to update
    
    if (name) {
        updateFields.name = name;  // If name is provided, add it to updateFields
    }
    
    if (description) {
        updateFields.description = description;  // If description is provided, add it to updateFields
    }
    
    const playlist = await Playlist.findByIdAndUpdate(playListId, updateFields, {
        new: true
    }); 

    if(!playlist){
        throw new ApiError(500,"Playlist not updated")
    }

    res.status(200).json(new ApiResponse(200,playlist,"Playlist updated successfully"))
})

const deletePlayList = asyncHandler(async (req,res)=>{
    const playListId = req.params.playListId;

    if(!playListId){
        throw new ApiError(400,"Please provide playListId")
    }

    const playlist = await Playlist.findByIdAndDelete(playListId);

    if(!playlist){
        throw new ApiError(500,"Playlist not deleted")
    }

    res.status(200).json(new ApiResponse(200,playlist,"Playlist deleted successfully"))
})

const addVideoToPlayList = asyncHandler(async (req,res)=>{
    const videoId = req.params.videoId;
    const playListId = req.params.playListId;

    if(!videoId || !playListId){
        throw new ApiError(400,"VideoId and playListId are required");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }

    const playList = await Playlist.findByIdAndUpdate(playListId,{
        $addToSet:{
            videosList: videoId
        }
    },{
        new: true
    })

    if(!playList){
        throw new ApiError(500,"Video could not be added to playlist")
    }

    res.status(200).json(new ApiResponse(200,playList,"Video added to playlist successfully"))
})

const removeVideoFromPlayList = asyncHandler(async (req,res)=>{
    const videoId = req.params.videoId;
    const playListId = req.params.playListId;

    if(!videoId || !playListId){
        throw new ApiError(400,"VideoId and playListId are required");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }

    const playList = await Playlist.findByIdAndUpdate(playListId, 
        {
            $pull: {
                videosList: videoId  // Removes the videoId from the videosList array
            }
        }, 
        {
            new: true  // Returns the updated playlist after the removal
        }
    );     

    if(!playList){
        throw new ApiError(500,"Video could not be removed from playlist")
    }

    res.status(200).json(new ApiResponse(200,playList,"Video removed from playlist successfully"))
})

const getUserPlaylists = asyncHandler(async (req,res)=>{
    const userId = req.user._id;

    if(!userId){
        throw new ApiError(400,"userId is required")
    }
    
    const playLists = await Playlist.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(userId)
            }
        }
    ])

    if(playLists.length === 0){
        throw new ApiError(404,"No playlists found for the user")
    }

    res.status(200).json(new ApiResponse(200,playLists,"Playlists fetched successfully"))
})

export {createPlayList ,getPlayList ,updatePlayListDetails, deletePlayList, addVideoToPlayList, removeVideoFromPlayList, getUserPlaylists}