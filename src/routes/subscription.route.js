import { Router } from "express";
import { getSubscribedChannels, toggleSubscription, unSubscribe, getUserSubscriptions } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/c/:channelId").get(getSubscribedChannels).post(toggleSubscription).delete(unSubscribe)

router.route("/").get(getUserSubscriptions)

export default router;