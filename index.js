import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";
import express from "express";
import connectDb from "./connectDb.js";
import { errorHandler, notFound } from "./middlewares/index.js";
import { healthRouter, postRouter, userRouter } from "./routes/index.js";

const app = express();
configDotenv({
	path: "./.env",
});
const connection = connectDb(process.env.MONGODB_URI, process.env.MONGODB_PASS);

// global middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/post", postRouter);

// error handler and not found middleware
app.use(notFound);
app.use(errorHandler);

// connecting database
connection()
	.then(() => {
		app.listen(process.env.PORT || 8000, () => {
			console.log(
				`Server starting at http://localhost:${process.env.PORT || 8000}`,
			);
		});
	})
	.catch((err) =>
		console.log("Error while making connection to database ", err),
	);
