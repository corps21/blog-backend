import { ApiResponse, asyncReqHandler } from "../utils/index.js";

const checkHealth = asyncReqHandler((_req, res) => {
	res.status(200).json(new ApiResponse("Server Healthy", {}, 200));
});

export { checkHealth };
