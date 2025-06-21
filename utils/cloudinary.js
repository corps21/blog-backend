import { tryCatchWrapper } from "./index.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    secure: true
});

const cloudinaryImageUpload = tryCatchWrapper( async ( imagePath, options = { use_filename: true }
  ) => {
    if(!imagePath) throw new Error("Image path is empty")
    const result = await cloudinary.uploader.upload(imagePath, options);
    if (!result)
      throw new Error("Something went wrong uploading image");
    return result.public_id;
  }
);

const getCloudinaryImage = tryCatchWrapper( async (publicId, options = {colors: true}) => {
    if(!publicId) throw new Error("publicId is required")
    const result = await cloudinary.api.resource(publicId,options);
    return result;
})

export {cloudinaryImageUpload, getCloudinaryImage};
