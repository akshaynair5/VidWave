import { Router } from "express";
import { checkHealth } from "../controllers/healthcheck.controller.js";

const router = Router();

router.route("/").get(checkHealth);

export default router;