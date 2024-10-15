import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema  = new mongoose.Schema({
    username: {
        type:String,
        required:true,
        unique:true,
        trim:true,
        minlength:3,
        maxlength:50,
        lowercase:true,
        index:true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type: String,    // from cloudinary
        required: true,
    },
    coverImage:{
        type:String,    // from cloudinary

    },
    password:{
        type:String,
        required: [true,'Password is required'],
        minlength:6,
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    refreshToken: {
        type: String,
    }

},{timestamps: true})


userSchema.pre('save',async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10)   // 10 levels of hashing
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id:this._id,
        username:this.username,
        fullName:this.fullName,
        email:this.email,
    }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this._id,      // The Refresh Token has lesser data as it is refreshed at a higher rate.
    }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_EXPIRY})
}


export const User = mongoose.model("User",userSchema); 