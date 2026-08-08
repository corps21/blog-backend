import { createServer } from "node:http";
import { config as configDotenv } from "dotenv";
import { createApp } from "./app/app.js";
import { connectDb } from "./db/connectDb.js";
import { redisClient } from "./redis/createRedisClient.js";

configDotenv({
	path: "./.env",
});

async function main() {
	try {
		const PORT = process.env.PORT ?? 8000;

		const app = createApp();
		const server = createServer(app);
		const connection = connectDb(
			process.env.MONGODB_URI,
			process.env.MONGODB_PASS,
		);

		await connection();
		await redisClient.connect();

		server.listen(PORT, () => {
			console.log(`Server started at http://localhost:${PORT}`);
		});
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
}

main();
