import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlayList, createPlayList, deletePlayList, getPlayList, getUserPlaylists, removeVideoFromPlayList, updatePlayListDetails } 
from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlayList)

router.route("/:playListId").get(getPlayList).patch(updatePlayListDetails).delete(deletePlayList)

router.route("/add/:videoId/:playListId").patch(addVideoToPlayList)

router.route("/remove/:videoId/:playListId").patch(removeVideoFromPlayList)

router.route("/:userId").get(getUserPlaylists)

export default router;