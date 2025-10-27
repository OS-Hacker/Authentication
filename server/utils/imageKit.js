require("dotenv").config();
const ImageKit = require("imagekit");
const fs = require("fs");

const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

let imagekit = null;
if (IMAGEKIT_PUBLIC_KEY && IMAGEKIT_PRIVATE_KEY && IMAGEKIT_URL_ENDPOINT) {
  imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT,
  });
} else {
  console.warn(
    "ImageKit not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT in .env to enable."
  );
}

const uploadToImageKit = async (file) => {
  if (!imagekit)
    throw new Error("ImageKit is not configured. Upload disabled.");
  try {
    const { originalname, buffer, mimetype, path: filePath } = file;

    let fileParam;
    // If multer memoryStorage used, buffer will exist
    if (buffer && buffer.length > 0) {
      // base64 data URL
      fileParam = `data:${
        mimetype || "application/octet-stream"
      };base64,${buffer.toString("base64")}`;
    } else if (filePath) {
      // read file from disk and convert to base64 data URL
      const data = fs.readFileSync(filePath);
      fileParam = `data:${
        mimetype || "application/octet-stream"
      };base64,${data.toString("base64")}`;
    } else {
      throw new Error("No file data available for upload");
    }

    const uploadResponse = await imagekit.upload({
      file: fileParam,
      fileName: `product_${Date.now()}_${originalname}`,
      folder: "/products",
      useUniqueFileName: true,
      tags: ["product-image"],
    });

    return {
      url: uploadResponse.url,
      fileId: uploadResponse.fileId,
      thumbnailUrl: uploadResponse.thumbnailUrl,
    };
  } catch (error) {
    // ImageKit SDK sometimes returns nested error objects
    console.error(
      "ImageKit upload error:",
      error?.response || error?.message || error
    );
    throw new Error("Failed to upload image to ImageKit");
  }
};

// Delete image from ImageKit
const deleteFromImageKit = async (fileId) => {
  if (!fileId || typeof fileId !== "string") {
    console.warn("Invalid fileId for deletion:", fileId);
    return;
  }
  if (!imagekit)
    throw new Error("ImageKit is not configured. Delete disabled.");
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error("ImageKit delete error:", error);
    throw new Error("Failed to delete image from ImageKit");
  }
};

// Generate authentication parameters for frontend
const getImageKitAuth = () => {
  if (!imagekit)
    throw new Error(
      "ImageKit is not configured. Authentication parameters unavailable."
    );
  return imagekit.getAuthenticationParameters();
};

const isConfigured = () => !!imagekit;

// // Parse array fields safely
const parseArrayField = (field) => {
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [field];
    } catch {
      return [field];
    }
  }
  return [];
};

// // Cleanup temporary files
const cleanupTempFiles = (files = []) => {
  files.forEach((file) => {
    if (file?.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
        console.log(`Removed temp file: ${file.path}`);
      } catch (e) {
        console.warn(`Failed to remove temp file ${file.path}:`, e.message);
      }
    }
  });
};

// // Cleanup function for failed operations
const cleanupFailedProductCreation = async (uploadedImages = []) => {
  if (uploadedImages.length === 0) return;

  console.log(`Cleaning up ${uploadedImages.length} uploaded images due to failure`);

  const deletePromises = uploadedImages.map(async (image) => {
    if (image && image.fileId) {
      await deleteImageWithValidation(image.fileId);
    }
  });

  await Promise.allSettled(deletePromises);
};

// Parse boolean fields safely
const parseBooleanField = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return false;
};



module.exports = {
  imagekit,
  uploadToImageKit,
  deleteFromImageKit,
  getImageKitAuth,
  isConfigured,
  cleanupTempFiles,
  parseArrayField,
  cleanupFailedProductCreation,
  parseBooleanField,
};

// // ImageKit Utility Functions
// const validateImageKitResponse = (imageData) => {
//   if (!imageData || !imageData.fileId) {
//     throw new Error('Invalid ImageKit response: missing fileId');
//   }

//   // Ensure required fields are present
//   if (!imageData.url) {
//     throw new Error('Invalid ImageKit response: missing URL');
//   }

//   return {
//     fileId: imageData.fileId,
//     url: imageData.url,
//     thumbnailUrl: imageData.thumbnailUrl || imageData.url,
//     name: imageData.name || 'product-image',
//     size: imageData.size || 0,
//     fileType: imageData.fileType || 'image'
//   };
// };

// const uploadImageWithValidation = async (file) => {
//   try {
//     const imageData = await uploadToImageKit(file);
//     return validateImageKitResponse(imageData);
//   } catch (error) {
//     console.error('ImageKit upload failed:', error);
//     throw new Error(`Image upload failed: ${error.message}`);
//   }
// };

// const deleteImageWithValidation = async (fileId) => {
//   if (!fileId || typeof fileId !== 'string') {
//     console.warn('Invalid fileId for deletion:', fileId);
//     return;
//   }

//   try {
//     await deleteFromImageKit(fileId);
//     console.log(`Successfully deleted image: ${fileId}`);
//   } catch (error) {
//     // Log but don't throw - deletion failures shouldn't block operations
//     console.warn(`Failed to delete image ${fileId}:`, error.message);
//   }
// };

