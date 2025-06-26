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
router.get("/", asyncReqHandler(getAllPublicPosts)); // DONE ✅

// Protected route
router
	.route("/")
	.post(asyncReqHandler(verifyJWT), asyncReqHandler(createPost)) // DONE ✅
	.get(asyncReqHandler(verifyJWT), asyncReqHandler(searchPosts)); // Not working

router
	.route("/:id")
	.put(asyncReqHandler(verifyJWT), asyncReqHandler(updatePost)) // DONE ✅
	.patch(
		asyncReqHandler(verifyJWT),
		asyncReqHandler(upload.single("coverImage")),
		asyncReqHandler(updateCoverImage),
	); // DONE ✅

export default router;
