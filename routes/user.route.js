import { Router } from "express";
import { asyncReqHandler } from "../utils/index.js";
const router = Router()
import { loginUser, registerUser } from "../controllers/user.controller.js";

router.post("/register", asyncReqHandler(registerUser))

router.post("/login", asyncReqHandler(loginUser))

export default router