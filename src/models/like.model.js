import mongoose from "mongoose";

const likeSchema =  new mongoose.Schema({
    likedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video",
        required: true
    },
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Tweet",
        required: true
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Comment",
        required: true
    }

}, {timestamps: true} )

export const Like = mongoose.model("Like",likeSchema) 