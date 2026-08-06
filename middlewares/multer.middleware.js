import path from "node:path";
import multer from "multer";
import { ApiError } from "../utils/index.js";

const storage = multer.diskStorage({
	destination(_req, _file, cb) {
		cb(null, path.resolve("./public/temp"));
	},
	filename(req, file, cb) {
		const uniqueSuffix = `${Date.now()}-${req?.user?._id}`;
		cb(null, `${file.fieldname}-${uniqueSuffix}`);
	},
});

const limits = {
	fileSize: 31457280, // 30 mb
};

const fileFilter = (_req, file, cb) => {
	if (file.mimetype.slice(0, 5) !== "image") {
		cb(new ApiError(400, "Only Image file is allowed"));
	} else cb(null, true);
};

const upload = multer({ storage, limits});

export { upload };
