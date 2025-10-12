const cloudinary = require("cloudinary").v2;
const path = require("path");
require("dotenv").config();

// Configure cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload local file to Cloudinary
 * @param {string} filePath - local path to file
 * @returns {Promise<object>} - cloudinary upload result
 */
async function uploadToCloudinary(filePath) {
  if (!filePath) throw new Error("filePath is required");
  const folder = process.env.CLOUDINARY_FOLDER || "products";
  const filename = path.basename(filePath);

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    use_filename: true,
    unique_filename: true,
    resource_type: "image",
  });

  return result;
}

/**
 * Delete resource from Cloudinary by public_id
 * @param {string} publicId
 */
async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

module.exports = { uploadToCloudinary, deleteFromCloudinary };
