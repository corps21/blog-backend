import { Router } from "express";
import { getAllPosts, getPublicPosts } from "../controllers/post.controller.js";
import {
	changeUserPassword,
	getCurrentUser,
	loginUser,
	logoutUser,
	refreshAccessToken,
	registerUser,
	updateAvatar,
	updateUserDetails,
} from "../controllers/user.controller.js";
import { upload, verifyJWT } from "../middlewares/index.js";
import { asyncReqHandler } from "../utils/index.js";

const router = Router();

// Public route
router
	.post("/register", asyncReqHandler(registerUser)) // DONE ✅
	.post("/refresh-token", asyncReqHandler(refreshAccessToken)) // DONE ✅
	.post("/login", asyncReqHandler(loginUser)); // DONE ✅

// Protected route
router
	.route("/me")
	.get(asyncReqHandler(verifyJWT), asyncReqHandler(getCurrentUser)) // DONE ✅
	.put(asyncReqHandler(verifyJWT), asyncReqHandler(updateUserDetails)); // DONE ✅

router
	.post("/logout", asyncReqHandler(verifyJWT), asyncReqHandler(logoutUser)) // DONE ✅
	.get("/posts", asyncReqHandler(verifyJWT), asyncReqHandler(getAllPosts)) // DONE ✅
	.post(
		"/password",
		asyncReqHandler(verifyJWT),
		asyncReqHandler(changeUserPassword),
	) // DONE ✅
	.put(
		"/avatar",
		asyncReqHandler(verifyJWT),
		asyncReqHandler(upload.single("avatar")),
		asyncReqHandler(updateAvatar),
	) // DONE ✅
	.get(
		"/:id/posts",
		asyncReqHandler(verifyJWT),
		asyncReqHandler(getPublicPosts),
	); // DONE ✅

export default router;
