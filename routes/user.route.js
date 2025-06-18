import { Router } from "express";
import { asyncReqHandler } from "../utils/index.js";
const router = Router()
import { loginUser, registerUser, logoutUser, refreshAccessToken, getCurrentUser, changeUserPassword, updateUserDetails } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.post("/register", asyncReqHandler(registerUser))
router.post('/refresh-token',asyncReqHandler(refreshAccessToken))
router.post("/login", asyncReqHandler(loginUser))

// Need authentication
router.post("/logout",asyncReqHandler(verifyJWT),asyncReqHandler(logoutUser))
router.get("/current", asyncReqHandler(verifyJWT), asyncReqHandler(getCurrentUser))
router.post("/change-password", asyncReqHandler(verifyJWT), asyncReqHandler(changeUserPassword))
router.put("/update", asyncReqHandler(verifyJWT),asyncReqHandler(updateUserDetails))

export default router