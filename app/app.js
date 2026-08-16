import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { errorHandler, notFound } from "../middlewares/index.js";
import { healthRouter, postRouter, userRouter } from "../routes/index.js";

export function createApp() {
	const app = express();

	app.use(
		cors({
			origin: process.env.CORS,
			credentials: true,
		}),
	);

	app.use(express.json({ limit: "16Kb" }));
	app.use(express.urlencoded({ extended: true }));
	app.use(cookieParser());

	app.use("/api/v1/health", healthRouter);
	app.use("/api/v1/user", userRouter);
	app.use("/api/v1/post", postRouter);

	app.use(notFound);
	app.use(errorHandler);

	return app;
}
