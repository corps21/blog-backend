import { Router } from "express";
import { asyncReqHandler } from "../utils/index.js";
import {
    loginUser,
    registerUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeUserPassword,
    updateUserDetails,
    updateAvatar
} from "../controllers/user.controller.js";
import { verifyJWT, upload } from "../middlewares/index.js";
const router = Router();

router.post("/register",asyncReqHandler(upload.single('avatar')),asyncReqHandler(registerUser));
router.post("/refresh-token", asyncReqHandler(refreshAccessToken));
router.post("/login", asyncReqHandler(loginUser));

// Need authentication
router.post("/logout", asyncReqHandler(verifyJWT), asyncReqHandler(logoutUser));
router.get("/current",asyncReqHandler(verifyJWT),asyncReqHandler(getCurrentUser));
router.post("/change-password",asyncReqHandler(verifyJWT),asyncReqHandler(changeUserPassword));
router.put("/update",asyncReqHandler(verifyJWT),asyncReqHandler(updateUserDetails));
router.patch("/avatar",asyncReqHandler(verifyJWT),asyncReqHandler(upload.single("avatar")),asyncReqHandler(updateAvatar))

export default router;
