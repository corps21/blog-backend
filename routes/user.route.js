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
	updateAvatar,
} from "../controllers/user.controller.js";
import { verifyJWT, upload } from "../middlewares/index.js";
const router = Router();

router.post("/register", asyncReqHandler(registerUser));
router.post("/refresh-token", asyncReqHandler(refreshAccessToken));
router.post("/login", asyncReqHandler(loginUser));

// Need authentication
router.post("/logout", asyncReqHandler(verifyJWT), asyncReqHandler(logoutUser));

// TODO: check routes
router
	.route("/", asyncReqHandler(verifyJWT))
	.get("/", asyncReqHandler(getCurrentUser))
	.put("/", asyncReqHandler(updateUserDetails));

router.post(
	"/password",
	asyncReqHandler(verifyJWT),
	asyncReqHandler(changeUserPassword),
);

router.put(
	"/avatar",
	asyncReqHandler(verifyJWT),
	asyncReqHandler(upload.single("avatar")),
	asyncReqHandler(updateAvatar),
);

export default router;
