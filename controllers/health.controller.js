import { ApiResponse } from "../utils/index.js";

function checkHealth(_req, res) {
	return res.status(200).json(new ApiResponse("Server Healthy", {}, 200));
}

export { checkHealth };
