import { createClient as createClientRedis } from "redis";

export function createClient() {
	const client = createClientRedis({
		url: process.env.REDIS_URL,
	});

	client.on("error", (err) => {
		console.log("Redis Client Error", err);
	});
	return client;
}

export const redisClient = createClient();
