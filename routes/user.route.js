import { Router } from "express";
import { asyncReqHandler } from "../utils/index.js";
const router = Router()
import { loginUser, registerUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.post("/register", asyncReqHandler(registerUser))
router.post("/login", asyncReqHandler(loginUser))
router.post("/logout",asyncReqHandler(verifyJWT),asyncReqHandler(logoutUser))
router.post('/refresh-token',asyncReqHandler(refreshAccessToken))


export default router