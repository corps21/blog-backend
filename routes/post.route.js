import { Router } from "express";
import {
	createPost,
	deletePost,
	getAllPublicPosts,
	getPostSummary,
	getPublicPostBySlug,
	searchPosts,
	suggestPostsSemantic,
	updateCoverImage,
	updatePost,
} from "../controllers/post.controller.js";
import { denyAnonymous, upload, verifyJWT } from "../middlewares/index.js";
import { asyncReqHandler } from "../utils/index.js";

const router = Router();

// Public route
router.get("/public", getAllPublicPosts); // DONE ✅

// Protected route
router
	.route("/")
	.post(verifyJWT, denyAnonymous, createPost) // DONE ✅
	.get(verifyJWT, searchPosts) // DONE ✅
	.get(verifyJWT, suggestPostsSemantic);

router
	.route("/:slug")
	.get(getPublicPostBySlug) // DONE ✅
	.put(verifyJWT, updatePost) // DONE ✅
	.delete(verifyJWT, deletePost) // DONE ✅
	.patch(
		verifyJWT,
		asyncReqHandler(upload.single("coverImage")),
		updateCoverImage,
	); // DONE ✅

router.get("/:slug/summary", verifyJWT, getPostSummary);
export default router;
