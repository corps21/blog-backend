import { Router } from "express";
import {
	createPost,
	getAllPublicPosts,
	searchPosts,
	updateCoverImage,
	updatePost,
} from "../controllers/post.controller.js";
import { upload, verifyJWT } from "../middlewares/index.js";
import { asyncReqHandler } from "../utils/index.js";

const router = Router();

// Public route
router.get("/public", getAllPublicPosts); // DONE ✅

// Protected route
router
	.route("/")
	.post(verifyJWT, createPost) // DONE ✅
	.get(verifyJWT, searchPosts); // DONE ✅

router
	.route("/:id")
	.put(verifyJWT, updatePost) // DONE ✅
	.patch(
		verifyJWT,
		asyncReqHandler(upload.single("coverImage")),
		updateCoverImage,
	); // DONE ✅

export default router;
