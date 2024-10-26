import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller";

const router = Router();
router.use(verifyJWT);

router.route("/channel-stats").get(getChannelStats)
router.route("/channel-videos").get(getChannelVideos)

export default router;