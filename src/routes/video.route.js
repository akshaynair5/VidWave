import {Router} from 'express'
import { deleteVideo, getAllVideos, getVideoById, publishVideo, updateVideo } from '../controllers/video.controller'
import { upload } from '../middlewares/multer.middleware'

const router = Router()

router.route("/").get(getAllVideos).post(
    upload.fields([
        {
            name: "video",
            maxCount:1
        },
        {
            name: "thumbnail",
            maxCount:1
        }
    ]),
    publishVideo
)

router.route("/:videoId").get(getVideoById).patch(updateVideo).delete(deleteVideo)

export default router