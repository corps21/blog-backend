import { AnonUser, User } from "../models/index.js";
import {
	ApiError,
	asyncReqHandler,
	promisedJWTVerify,
} from "../utils/index.js";

const verifyJWT = asyncReqHandler(async (req, _, next) => {
	const token =
		req.cookies?.accessToken ||
		req.headers.authorization?.replace("Bearer ", "");
	if (!token) throw new ApiError(401, "Need token for this request");
	const decodedUser = await promisedJWTVerify(
		token,
		process.env.ACCESS_TOKEN_SECRET,
	);
	if (!decodedUser) throw new ApiError(401, "Invalid token");
	const user =
		decodedUser.kind === "User"
			? await User.findById(decodedUser._id)
			: await AnonUser.findById(decodedUser._id);
	if (!user) throw new ApiError(404, "User not found");
	req.user = user;
	req.token = token;
	next();
});

export { verifyJWT };
