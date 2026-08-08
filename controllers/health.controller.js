import { redisClient } from "../redis/createRedisClient.js";
import { ApiResponse, asyncReqHandler } from "../utils/index.js";

const checkHealth = asyncReqHandler(async (_req, res) => {
	const redisStatus = await redisClient.ping();
	if (!redisStatus) throw new Error("Redis is not healthy");

	res.status(200).json(
		new ApiResponse(
			"Server Healthy",
			{
				redis: redisStatus,
			},
			200,
		),
	);
});

export { checkHealth };
