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
// check route
router.get("/", asyncReqHandler(getAllPublicPosts));

// Need authentication
router
	.route("/")
	.all(asyncReqHandler(verifyJWT))
	.post(asyncReqHandler(createPost))
	// check route
	.get(asyncReqHandler(searchPosts));
router
	.route("/:id")
	.all(asyncReqHandler(verifyJWT))
	.put(asyncReqHandler(updatePost))
	.patch(
		asyncReqHandler(upload.single("coverImage")),
		asyncReqHandler(updateCoverImage),
	);

export default router;
