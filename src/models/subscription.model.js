import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    subscriber: {
        type:mongoose.Schema.Types.ObjectId,         // This is not a list as there are situations where we need show 'subscribed' while viewing a 
        ref:'User'                                   // channels home page this can be achieved easily using this way
    }

},{timestamps: true})

export const Subscription = new mongoose.model('Subscription', subscriptionSchema)