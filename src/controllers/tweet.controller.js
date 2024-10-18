import { Tweet } from "../models/tweet.model";
import ApiError from "../utils/apiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const createTweet = asyncHandler(async (req,res)=>{
    const content = req.body.content
    const user = req.user;

    if(!content){
        throw new (new ApiError(400,"Content is required"))
    }

    const tweet = await Tweet.create({
        owner: user._id,
        content: content
    })

    if(!tweet){
        throw new ApiError(500,"Failed to create tweet")
    }

    res.status(201).json(new ApiResponse(201,tweet,"Tweet has been created successfully!"))
})

const getUserTweets = asyncHandler(async (req,res)=>{
    const tweets = await Tweet.find({owner: req.user._id})

    if(!tweets){
        throw new ApiError(400,"No tweets found for this user")
    }

    res.status(200).json(new ApiResponse(200,tweets,"Tweets found Successfully"))
})

const updateTweet = asyncHandler(async (req,res)=>{
    const tweetId = req.params.tweetId;
    const newContent = req.body.content;

    if(!tweetId || !newContent){
        throw new ApiError(400,"TweetId and newContent are required")
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId,{content: newContent},{new: true})

    if(!tweet){
        throw new ApiError(500,"Tweet could now be updated");
    }

    res.status(200).json(new ApiResponse(200,tweet,"Tweet has been updated successfully"))
})

const deleteTweet = asyncHandler(async (req,res)=>{
    const tweetId = req.params.tweetId;

    if(!tweetId){
        throw new ApiError(400,"TweetId is required")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    if(!tweet){
        throw new ApiError(500,"Tweet could not be deleted")
    }

    res.status(200).json(new ApiResponse(200,tweet,"Tweet has been deleted successfully"))
})

export {createTweet ,getUserTweets ,updateTweet ,deleteTweet }