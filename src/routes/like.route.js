import { Router } from 'express';
import {
    likeVideo,
    likeComment,
    likeTweet,
    getLikedVideos,
    unlike,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/toggle/v/:videoId").post(likeVideo);
router.route("/toggle/c/:commentId").post(likeComment);
router.route("/toggle/t/:tweetId").post(likeTweet);
router.route("/videos").get(getLikedVideos);
router.route("/:likeId").delete(unlike);

export default router;