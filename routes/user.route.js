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
	.post("/register", registerUser) // DONE ✅
	.post("/refresh-token", refreshAccessToken) // DONE ✅
	.post("/login", loginUser); // DONE ✅

// Protected route
router
	.route("/me")
	.get(verifyJWT, getCurrentUser) // DONE ✅
	.put(verifyJWT, updateUserDetails); // DONE ✅

router
	.post("/logout", verifyJWT, logoutUser) // DONE ✅
	.get("/posts", verifyJWT, getAllPosts) // DONE ✅
	.post("/password", verifyJWT, changeUserPassword) // DONE ✅
	.put(
		"/avatar",
		verifyJWT,
		asyncReqHandler(upload.single("avatar")),
		updateAvatar,
	) // DONE ✅
	.get("/:id/posts", verifyJWT, getPublicPosts); // DONE ✅

export default router;
