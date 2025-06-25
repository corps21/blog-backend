import { User } from "../models/index.js";
import { ApiError, promisedJWTVerify } from "../utils/index.js";

async function verifyJWT(req, _, next) {
	const accessToken =
		req.cookies?.accessToken ||
		req.headers.Authorization?.replace("Bearer ", "");
	if (!accessToken)
		throw new ApiError(401, "Need access token for this request");
	const decodedUser = await promisedJWTVerify(
		accessToken,
		process.env.ACCESS_TOKEN_SECRET,
	);
	if (!decodedUser) throw new ApiError(401, "Invalid access token");
	const user = await User.findById(decodedUser._id).select(
		"-password -refreshToken",
	);
	if (!user) throw new ApiError(404, "User not found");
	req.user = user;
	next();
}

export { verifyJWT };
