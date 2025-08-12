import { unlink } from "node:fs/promises";
import { cloudinaryImageRemove, cloudinaryImageUpload } from "./cloudinary.js";
import tryCatchWrapper from "./tryCatchWrapper.js";

const uploadHandler = tryCatchWrapper(async (path) => {
	const uploadedImage = await cloudinaryImageUpload(path);
	if (!uploadedImage) throw new ApiError(500, "Error while uploading image");
	const isFileDeleted = await unlink(path);
	if (isFileDeleted) throw new ApiError(500, "error while deleting image");

	return uploadedImage;
});

// Check for the validity of url
const deleteHandler = tryCatchWrapper(async (url) => {
	const publicId = url.split("/").at(-1).split(".")[0];
	const isCloudinaryRemoved = await cloudinaryImageRemove([publicId]);
	if (!isCloudinaryRemoved)
		throw new ApiError(500, "Error while deleting previous image");

	return isCloudinaryRemoved;
});
export { uploadHandler, deleteHandler };
