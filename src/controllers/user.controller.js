import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadToCloudinary from "../utils/fileUpload.js";
import ApiError from "../utils/apiError.js";
import deleteFromCloudinary from "../utils/fileDelete.js";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) =>{
    try{
        const user = await User.findById(userId) 
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})                      // As password field is not present here we should not validate it
        
        return {accessToken,refreshToken}        
    }
    catch(err){
        console.log(err)
        throw new ApiError(500,"Something went wrong during token generation")
    }
}

const registerUser = asyncHandler(async (req,res) => {
    // Get details from request
    // validate details from user
    // check for files
    // upload file and retrieve URL 
    // create user object and add object as db entry
    // receive response from db 
    // remove password and refresh token from response
    // check for user creation confirmation
    // return response to client

    const {fullName,email,password,username} = req.body

    if([fullName,email,password,username].some(field => field.trim() === "")){
        throw new ApiError(400,"All fields are required")
    }

    const existingUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existingUser){
        throw new ApiError(409,"User with the same username or email already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path                                // Here avatar is the name of the file type given in user.routes
    let coverImageLocalPath
    // The above req.files if printed will give us an array of objects consisting of info like originalname, encoding, mimetype, destination, 
    // filename, path, size, etc.

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath)
    const coverImage = await uploadToCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar is Required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong during user registration")
    }

    return res.status(201).json(new ApiResponse(200,createdUser,"User registered successfully"))


});

const loginUser = asyncHandler(async (req,res)=>{
    // Get details from request
    // username or email should be there and valid along with password
    //find the user in db
    // check if password is correct
    // generate refresh token and access token
    // return refresh and access token as secure cookie

    const {email,username,password} = req.body

    if(!username && !email){
        throw new ApiError(400,"Username or email is required")
    }

    const userExists = await User.findOne({
        $or: [{username},{email}]
    })

    if(!userExists){
        throw new ApiError(401,"username or email does not exist")
    }

    const isPasswordValid = await userExists.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Incorrect password")
    }   

    const {refreshToken,accessToken} = await generateAccessAndRefreshTokens(userExists._id)

    const loggedInUser = await User.findById(userExists._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,                 // What this does is that the cookies we create are now modifiable only by the server and not the browser itself.
        secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{
        user: loggedInUser,
        accessToken,                              // We are sending this again to take care of the case when the use might be using a mobile app and wants to store the token in the app's local storage.
        refreshToken                              // or in cases where the user want to store the information somewhere else as well 
    }))



});

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
            $unset: {refreshToken: 1}                 // Removes the refresh token from the user object
        },
        {
            new: true                                   // This tells the method to return the updated document value instead of the original one.
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,"User logged out successfully"))
});

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken  = req.cookies.refreshToken ||  req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Refresh Token not Available")
    }

    const decodedToken = await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    if(!decodedToken){
        throw new ApiError(401,"Invalid Token")
    }

    const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    if(incomingRefreshToken !== user.refreshToken){
        throw new ApiError(401,"Invalid Token")
    }
    const {refreshToken,accessToken} = await generateAccessAndRefreshTokens(user._id)
    const options = {
        httpOnly: true,
        secure: true
    }

    // await user.save({validateBeforeSave: false},{
    //     refreshToken:refreshToken
    // })
    
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{
        user,
        accessToken,
        refreshToken
    }))
})

const changeCurrentPassword = asyncHandler(async (req,res)=>{
    const {currentPassword, newPassword} = req.body

    if(!currentPassword || !newPassword){
        throw new ApiError(400,"New Password and Previous Password is required")
    }

    const user  = await User.findById(req.user?._id)
    if(!(await user.isPasswordCorrect(currentPassword))){
        throw new ApiError(401,"Incorrect Password")
    }

    user.password = newPassword  // We do not need to hash the password as we have built a pre function that would hash the values automatically before saving to the db.
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"));

})

const getCurrentUser = asyncHandler(async (req,res)=>{
    res.status(200).json(new ApiResponse(200,req.user,"User has been fetched successfully"))
})

const updateUserDetails = asyncHandler(async (req,res)=>{
    const {fullName,email} = req.body;

    if(!(fullName || email)){
        throw new ApiError(400,"Full Name or Email is required")
    }

    emailExists = await User.findOne({email})
    if(emailExists){
        throw new ApiError(409,"Email already exists");
    }

    // const user = req.user;
    // user.fullName = fullName;
    // user.email = email;

    // await user.save({validateBeforeSave:false});

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                fullName,
                email
            }   
        },
        {new:true}
    ).select("-password -refreshToken")

    res.status(200).json(new ApiResponse(200,user,"User information has been uploaded successfully"))

})

const updateAvatar = asyncHandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path;
    const prevAvatar = req.user.avatar

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(400,"Error while uploading Avatar")
    }

    await deleteFromCloudinary(prevAvatar)
    // user.avatar = avatar.url;
    // await user.save({validateBeforeSave:false});

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new:true}
    ).select("-password -refreshToken")

    res.status(200).json(new ApiResponse(200,user,"Avatar has been uploaded successfully"))

})

const updateCoverImage = asyncHandler(async (req,res)=>{
    const coverImageLocalPath = req.file?.path;
    const token = req.cookies.accessToken || req.header("Authorization").replace("Bearer ", "");
    const prevCoverImage = req.user.avatar

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image is required")
    }

    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading Cover Image")
    }

    await deleteFromCloudinary(prevCoverImage);

    // user.avatar = avatar.url;
    // await user.save({validateBeforeSave:false});

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new:true}
    ).select("-password -refreshToken")

    res.status(200).json(new ApiResponse(200,user,"Cover Image has been uploaded successfully"))

})

const getUserChannelProfile = asyncHandler(async (req,res)=>{
    const channelUserId = req.params.username;
    if(!channelUser){
        throw new ApiError(400,"Username is required")
    }

    const channel = await User.aggregate(
        [
            {
                $match:{
                    username: channelUserId.toLowerCase()                       // This fetches the user details of the channel from Users collection
                }
            },
            {
                $lookup: {                        // This joins the subscriptions collection with the users collection to get the list of subscribers and subscribed channels
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {                         // This does the same but with different conditions
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {                      // Adds new fields with the data that we would have from previous pipeline stages (Key-Value Pair)
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    subscriberToCount:{
                        $size: "$subscribedTo"
                    },
                    isSubscribed: {
                        $cond: {                          // This checks if the current user is already subscribed to the channel or not
                            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {                       // From the data received from previous pipeline stages we decide which fields to show to the client
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                    coverImage: 1,
                    subscribersCount: 1,
                    subscriberToCount: 1,
                    isSubscribed: 1,
                    email:1
                }
            }
        ]
    )
    if(!channel?.length > 1){
        throw new ApiError(400,"Channel does not exist")
    }

    res.status(200).json(new ApiResponse(200,channel,"Channel has retrieved successfully"))

})

const getWatchHistory = asyncHandler(async (req,res)=>{
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",         // Using this we are collecting all the videos that are there in the watchHistory array of the user
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup:{
                            from: "users",                  // Based on the data that has already been collected by the previous pipeline
                            localField: "owner",            // we collect the owner details of the video from the each of the video object that has generated
                            foreignField: "_id",
                            as: "owner"
                        },
                        
                        pipeline: [                         // Now within each of the objects that we have here (list of objs) we just collect the  
                            {                               // required fields from the owner object (We could have done this outside as well but the
                                                            // format would be different.)
                                $project: {
                                    fullName: 1,
                                    username: 1,
                                    avatar: 1
                                }
                            }
                        ]

                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"          // Makes it easier for the frontend dev to display data as lookup send us an array back  
                            }                             // As we know for sure that the is only a single user we do not need to send the array and include 
                                                          // that within the data that we send hence the first is taken out and projected as the owner field.
                        }
                    }
                ]         // All this so far is within the owner field
            }
        }
    ])

    res.status(200).json(new ApiResponse(200,user[0].watchHistory,"Watch History has been retrieved successfully"))

})

export {registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateUserDetails, updateAvatar, updateCoverImage, getUserChannelProfile, getWatchHistory};