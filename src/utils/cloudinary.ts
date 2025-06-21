import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadFile = async (filePath: string) => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true
  };

  try {
    if (!process.env.CLOUDINARY_API_KEY) {
      throw new Error("Cloudinary API key is missing!");
    }

    const result = await cloudinary.uploader.upload(filePath, options);
    return {
      public_id: result.public_id,
      url: result.url
    };
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
};

export const uploadImages = async (imagePaths: string[]) => {
  const uploadedImages: string[] = [];

  for (const imagePath of imagePaths) {
    try {
      const uploadedImage = await uploadFile(imagePath);
      uploadedImages.push(uploadedImage.url);
    } catch (error) {
      console.error(`Error uploading image "${imagePath}":`, error);
    }
  }

  return uploadedImages;
};
