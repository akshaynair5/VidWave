import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateAvatar, updateCoverImage, updateUserDetails } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { get } from "mongoose";

const router = Router();

router.route("/register").post(
    upload.fields([                       // Use upload.single to upload a single file
        {
            name: 'avatar',              // This name given here is used to refer this particular file in userController 
            maxCount: 1
        },
        {
            name:'coverImage',
            maxCount: 1
        }
    ]),
    registerUser
);   // Here the upload middleware is used to handle the file uploads and it will ake sure that the files are uploaded before moving the other steps

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser)  

router.route("/refresh-token").post(refreshAccessToken)
// Here req. res, next etc are sent by default to each of the functions in the controller. 
// So we need to use verifyJWT middleware to check if the token is valid or not.

router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").post(verifyJWT,getCurrentUser)

router.route("/upload-avatar").patch(upload.single("avatar"), updateAvatar)

router.route("/upload-cover-image").patch(upload.single("coverImage"), updateCoverImage)

router.route("/update-user-details").patch(verifyJWT,updateUserDetails)

router.route("/c/:username").get(verifyJWT,getUserChannelProfile)

router.route("/watch-history").get(verifyJWT, getWatchHistory)

export default router; 