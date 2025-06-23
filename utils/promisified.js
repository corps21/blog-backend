import jwt from "jsonwebtoken";
import { promisify } from "./promisify.js";

const sign = promisify(jwt.sign);
const verify = promisify(jwt.verify);

export { sign, verify };
