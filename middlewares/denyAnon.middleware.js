import { ApiError, asyncReqHandler } from "../utils/index.js";

// DEV: always should be used after auth middleware
export const denyAnonymous = asyncReqHandler(async (req, _, next) => {
	if (!req?.user) throw new ApiError(401, "Need access token for this request");
	const user = req?.user;

	if (user.kind === "AnonUser") {
		throw new ApiError(403, "Only available for registered users");
	}

	next();
});
