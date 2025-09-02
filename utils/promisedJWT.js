import jwt from "jsonwebtoken";
import { ApiError } from "./apiError.js";
import { promisify } from "./promisify.js";

const sign = promisify(jwt.sign);
const verify = (...rest) => {
	return new Promise((resolve, reject) => {
		jwt.verify(...rest, (err, data) => {
			if (err) {
				reject(new ApiError(401, err.message));
			} else {
				resolve(data);
			}
		});
	});
};

export { sign, verify };
