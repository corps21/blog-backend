import { Router } from "express"
import { asyncReqHandler } from "../utils/index.js"
import { createPost, updatePost, updateCoverImage } from "../controllers/post.controller.js"
import { verifyJWT } from "../middlewares/index.js"
import { upload } from "../middlewares/index.js"

const router = Router()

// Need authentication
router.use(asyncReqHandler(verifyJWT))
    .route("/", asyncReqHandler(verifyJWT))
    .post(asyncReqHandler(upload.single('coverImage')), asyncReqHandler(createPost))    
    .route("/:id")
    .put(asyncReqHandler(updatePost))
    .patch(asyncReqHandler(upload.single),asyncReqHandler(updateCoverImage))

export default router