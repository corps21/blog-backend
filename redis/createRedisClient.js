import { createClient as createClientRedis } from "redis";

export function createClient() {
	
	const client = createClientRedis({
		host: "localhost",
		port: 6379,
	});

	client.on("error", (err) => {
		console.log("Redis Client Error", err);
	});
	return client;
}

export const redisClient = createClient();
