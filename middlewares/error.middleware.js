import { configDotenv } from "dotenv";

configDotenv({
	path: "../.env",
});
// TODO: refactor errorHandler to handle more specific error
export function errorHandler(err, _req, res, _next) {
	if(err.code === 11000) {
		const field = Object.keys(err.keyPattern)[0]
		res.status(400)
		res.json({
			message: `${field} already exists`,
			stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack
		})
	} else {
		const statusCode = err?.statusCode ?? 500;
		process.env.NODE_ENV === "dev" && console.log(err);
		res.status(statusCode);
		res.json({
			message: err.message,
			stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
		});
	}

}
