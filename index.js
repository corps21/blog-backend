import cookieParser from "cookie-parser";
// import cors from "cors";
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
// app.use(
// 	cors({
// 		origin: "http://localhost:5173",
// 		credentials: true,
// 	}),
// );
app.use(express.json({ limit: "16Kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/post", postRouter);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT ?? 8000;
connection()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server starting at http://localhost:${PORT}`);
		});
	})
	.catch((err) =>
		console.log("Error while making connection to database ", err),
	);

export default app;
