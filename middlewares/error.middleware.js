import { configDotenv } from "dotenv";

configDotenv({
	path: "../.env",
});

export function errorHandler(err, _req, res, _next) {
	const statusCode = err.statusCode;
	res.status(statusCode);
	res.json({
		message: err.message,
		stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
	});
}
