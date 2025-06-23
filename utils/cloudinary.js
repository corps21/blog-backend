import { tryCatchWrapper } from "./index.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	secure: true,
});

const cloudinaryImageUpload = tryCatchWrapper(
	async (imagePath, options = { use_filename: true }) => {
		if (!imagePath) throw new Error("Image path is empty");
		const result = await cloudinary.uploader.upload(imagePath, options);
		return result;
	},
);

const cloudinaryImageRemove = tryCatchWrapper(
	async (publicIds, options = {}) => {
		if (publicIds.length === 0) throw new Error("publicId is empty");
		const result = await cloudinary.api.delete_resources(publicIds, options);
		return result;
	},
);

export { cloudinaryImageUpload, cloudinaryImageRemove };
