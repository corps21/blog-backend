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

router.post("/register", asyncReqHandler(registerUser));
router.post("/refresh-token", asyncReqHandler(refreshAccessToken));
router.post("/login", asyncReqHandler(loginUser));

// Need authentication
router.post("/logout", asyncReqHandler(verifyJWT), asyncReqHandler(logoutUser));
// TODO: check routes
router.get(
	"/:id/posts",
	asyncReqHandler(verifyJWT),
	asyncReqHandler(getPublicPosts),
);
router.get("/posts", asyncReqHandler(verifyJWT), asyncReqHandler(getAllPosts));
router
	.route("/", asyncReqHandler(verifyJWT))
	.get(asyncReqHandler(getCurrentUser))
	.put(asyncReqHandler(updateUserDetails));

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
