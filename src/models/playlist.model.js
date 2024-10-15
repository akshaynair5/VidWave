import mongoose from "mongoose";

const playlistSchema =  new mongoose.Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    videosList: {
        type: [
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
        ]
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        minLength: 10
    },
}, {timestamps: true} )

export const Playlist = mongoose.model("Playlist",playlistSchema) 