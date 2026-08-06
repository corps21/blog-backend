import { Router } from "express";
import { getAllPosts, getPublicPosts } from "../controllers/post.controller.js";
import {
	changeUserPassword,
	getCurrentUser,
	getUser,
	loginUser,
	logoutUser,
	refreshAccessToken,
	registerAnonUser,
	registerUser,
	updateAvatar,
	updateUserDetails,
} from "../controllers/user.controller.js";
import { upload, verifyJWT } from "../middlewares/index.js";
import { asyncReqHandler } from "../utils/index.js";

const router = Router();

// Public route
router
	.post("/register", registerUser) // DONE ✅
	.post("/refresh-token", refreshAccessToken) // DONE ✅
	.post("/login", loginUser) // DONE ✅
	.post("/anon-user", registerAnonUser); // DONE ✅

// Protected route
router
	.route("/me")
	.get(verifyJWT, getCurrentUser) // DONE ✅
	.patch(verifyJWT, updateUserDetails); // DONE ✅

router
	.post("/logout", verifyJWT, logoutUser) // DONE ✅
	.get("/posts", verifyJWT, getAllPosts) // DONE ✅
	.patch("/password", verifyJWT, changeUserPassword) // DONE ✅
	.patch(
		"/avatar",
		verifyJWT,
		asyncReqHandler(upload.single("avatar")),
		updateAvatar,
	) // DONE ✅
	// TODO: need access control for these routes
	.get("/:id", getUser) // DONE ✅
	.get("/:id/posts", verifyJWT, getPublicPosts); // DONE ✅

export default router;
