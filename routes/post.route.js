import Router from "express"
import { asyncReqHandler } from "../utils/index.js"
import {verifyJWT} from "../middlewares/index.js"
import {createPost} from "../controllers/post.controller.js"

const router = Router()

router.post("/",asyncReqHandler(verifyJWT),asyncReqHandler(createPost))
// router.route("/:id")

export default router