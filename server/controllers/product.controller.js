// const Product = require("../models/product.model");
// const {
//   uploadToCloudinary,
//   deleteFromCloudinary,
// } = require("../utils/cloudinary");
// const fs = require("fs");

// /**
//  * ProductController Class
//  *
//  * Handles all product-related CRUD operations including:
//  * - Create, Read, Update, Delete products
//  * - Image upload and management with Cloudinary
//  * - Pagination and filtering
//  * - Error handling and validation
//  */
// class ProductController {
//   /**
//    * CREATE PRODUCT
//    *
//    * Creates a new product with image upload to Cloudinary
//    * Preserves existing images while adding new ones
//    *
//    * @param {Object} req - Express request object
//    * @param {Object} req.body - Product data
//    * @param {Array} req.files - New image files to upload
//    * @param {Object} res - Express response object
//    */
//   async createProduct(req, res) {
//     try {
//       // Destructure product data from request body
//       const {
//         productName,
//         description,
//         price,

//         selectedValue,
//         stock,
//       } = req.body;

//       // Handle image uploads to Cloudinary
//       const imageUploads = [];
//       if (req.files && req.files.length > 0) {
//         // Process each uploaded file
//         for (const file of req.files) {
//           // Upload file to Cloudinary and get result
//           const result = await uploadToCloudinary(file.path);

//           // Store Cloudinary response data
//           imageUploads.push({
//             public_id: result.public_id, // Cloudinary public ID for future operations
//             url: result.secure_url, // Secure URL for accessing the image
//           });

//           // Remove file from local server storage after upload
//           fs.unlinkSync(file.path);
//         }
//       }

//       // Upload images to ImageKit
//       // let uploadedImages = [];

//       // if (req.files && req.files.length > 0) {
//       //   for (const file of req.files) {
//       //     try {
//       //       const imageData = await uploadToImageKit(file);
//       //       uploadedImages.push(imageData);
//       //     } catch (uploadError) {
//       //       console.error("Failed to upload image:", uploadError);
//       //       // Continue with other images even if one fails
//       //     }
//       //   }
//       // }

//       // Create new product instance with uploaded data
//       const product = new Product({
//         productName,
//         description,
//         price: price ? parseFloat(price) : 0,
//         categories: Array.isArray(categories)
//           ? categories
//           : categories
//           ? [categories]
//           : [],
//         selectedValue: selectedValue || null,
//         stock: stock ? parseInt(stock) : 0,
//         images: imageUploads,
//       });

//       // Save product to database
//       await product.save();

//       // Return success response with created product data
//       res.status(201).json({
//         success: true,
//         message: "Product created successfully",
//         data: product,
//       });
//     } catch (error) {
//       // Clean up uploaded files if error occurs during process
//       if (req.files) {
//         req.files.forEach((file) => {
//           try {
//             if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//           } catch (e) {
//             // ignore cleanup errors
//           }
//         });
//       }

//       // Return error response
//       res.status(500).json({
//         success: false,
//         message: "Error creating product",
//         error: error.message,
//       });
//     }
//   }

//   /**
//    * GET ALL PRODUCTS (with pagination)
//    *
//    * Retrieves all active products with pagination support
//    * Includes pagination metadata in response
//    *
//    * @param {Object} req - Express request object
//    * @param {Object} req.query - Query parameters (page, limit)
//    * @param {Object} res - Express response object
//    */
//   // controllers/product.controller.js
//   async getProducts(req, res, next) {
//     try {
//       // 🧩 Parse query parameters safely with defaults
//       const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
//       const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
//       const skip = (page - 1) * limit;

//       // 🔍 Build dynamic filter conditions
//       const filter = {};

//       // Example: search by name or category
//       if (req.query.search) {
//         const searchRegex = new RegExp(req.query.search, "i");
//         filter.$or = [
//           { name: searchRegex },
//           { description: searchRegex },
//           { category: searchRegex },
//         ];
//       }

//       // Example: filter by category
//       if (req.query.category) {
//         filter.category = req.query.category;
//       }

//       // Example: price range filter
//       if (req.query.minPrice || req.query.maxPrice) {
//         filter.price = {};
//         if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
//         if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
//       }

//       // 🧭 Sorting (default: newest first)
//       const sortField = req.query.sortBy || "createdAt";
//       const sortOrder = req.query.order === "asc" ? 1 : -1;

//       // ⚡ Fetch paginated + sorted + filtered products
//       const [products, total] = await Promise.all([
//         Product.find(filter)
//           .sort({ [sortField]: sortOrder })
//           .skip(skip)
//           .limit(limit)
//           .lean(), // performance boost
//         Product.countDocuments(filter),
//       ]);

//       // 📦 Standard success response
//       return res.status(200).json({
//         success: true,
//         message: "Products fetched successfully",
//         data: products,
//         pagination: {
//           totalItems: total,
//           totalPages: Math.ceil(total / limit),
//           currentPage: page,
//           itemsPerPage: limit,
//           hasNextPage: page * limit < total,
//           hasPrevPage: page > 1,
//         },
//       });
//     } catch (error) {
//       console.error("Error fetching products:", error);

//       // ⚠️ Consistent error structure
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error while fetching products",
//         error:
//           process.env.NODE_ENV === "development" ? error.message : undefined,
//       });
//     }
//   }

//   /**
//    * GET SINGLE PRODUCT
//    *
//    * Retrieves a specific product by ID
//    * Returns 404 if product not found
//    *
//    * @param {Object} req - Express request object
//    * @param {string} req.params.id - Product ID from URL parameters
//    * @param {Object} res - Express response object
//    */
//   async getProduct(req, res) {
//     try {
//       // Find product by ID
//       const product = await Product.findById(req.params.id);

//       // Check if product exists
//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: "Product not found",
//         });
//       }

//       // Return success response with product data
//       res.json({
//         success: true,
//         data: product,
//       });
//     } catch (error) {
//       // Return error response
//       res.status(500).json({
//         success: false,
//         message: "Error fetching product",
//         error: error.message,
//       });
//     }
//   }

//   /**
//    * UPDATE PRODUCT
//    *
//    * Updates an existing product with new data and optional new images
//    * Preserves existing images while adding new ones
//    *
//    * @param {Object} req - Express request object
//    * @param {string} req.params.id - Product ID to update
//    * @param {Object} req.body - Updated product data
//    * @param {Array} req.files - New image files to upload
//    * @param {Object} res - Express response object
//    */
//   async updateProduct(req, res) {
//     try {
//       // Destructure updated data from request body
//       const {
//         productName,
//         description,
//         price,
//         categories,
//         selectedValue,
//         stock,
//       } = req.body;
//       const productId = req.params.id;

//       // Find existing product
//       const product = await Product.findById(productId);
//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: "Product not found",
//         });
//       }

//       // Handle new image uploads
//       if (req.files && req.files.length > 0) {
//         const newImages = [];
//         // Process each new image file
//         for (const file of req.files) {
//           const result = await uploadToCloudinary(file.path);
//           newImages.push({
//             public_id: result.public_id,
//             url: result.secure_url,
//           });
//           try {
//             if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//           } catch (e) {}
//         }

//         // Merge new images with existing ones (preserve existing images)
//         product.images = [...product.images, ...newImages];
//       }

//       // Update product fields only if provided (partial update support)
//       if (typeof productName !== "undefined") product.productName = productName;
//       if (typeof description !== "undefined") product.description = description;
//       if (typeof price !== "undefined") product.price = parseFloat(price);
//       if (typeof categories !== "undefined")
//         product.categories = Array.isArray(categories)
//           ? categories
//           : categories
//           ? [categories]
//           : product.categories;
//       if (typeof selectedValue !== "undefined")
//         product.selectedValue = selectedValue;
//       if (typeof stock !== "undefined") product.stock = parseInt(stock);

//       // Save updated product to database
//       await product.save();

//       // Return success response with updated product
//       res.json({
//         success: true,
//         message: "Product updated successfully",
//         data: product,
//       });
//     } catch (error) {
//       // Clean up uploaded files if error occurs
//       if (req.files) {
//         req.files.forEach((file) => {
//           try {
//             if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//           } catch (e) {}
//         });
//       }

//       // Return error response
//       res.status(500).json({
//         success: false,
//         message: "Error updating product",
//         error: error.message,
//       });
//     }
//   }

//   /**
//    * DELETE PRODUCT
//    *
//    * Permanently deletes a product and all associated images from Cloudinary
//    *
//    * @param {Object} req - Express request object
//    * @param {string} req.params.id - Product ID to delete
//    * @param {Object} res - Express response object
//    */
//   async deleteProduct(req, res) {
//     try {
//       // Find product to be deleted
//       const product = await Product.findById(req.params.id);

//       // Check if product exists
//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: "Product not found",
//         });
//       }

//       // Delete all product images from Cloudinary
//       if (product.images && product.images.length > 0) {
//         for (const image of product.images) {
//           try {
//             await deleteFromCloudinary(image.public_id);
//           } catch (e) {
//             // log and continue
//             console.warn(
//               "Failed to delete image from Cloudinary:",
//               e.message || e
//             );
//           }
//         }
//       }

//       // Remove product from database
//       await Product.findByIdAndDelete(req.params.id);

//       // Return success response (no data returned for delete operations)
//       res.json({
//         success: true,
//         message: "Product deleted successfully",
//       });
//     } catch (error) {
//       // Return error response
//       res.status(500).json({
//         success: false,
//         message: "Error deleting product",
//         error: error.message,
//       });
//     }
//   }

//   /**
//    * DELETE PRODUCT IMAGE
//    *
//    * Removes a specific image from a product
//    * Deletes image from both Cloudinary and database
//    *
//    * @param {Object} req - Express request object
//    * @param {string} req.params.productId - Product ID
//    * @param {string} req.params.imageId - Image ID to delete
//    * @param {Object} res - Express response object
//    */
//   async deleteProductImage(req, res) {
//     try {
//       const { productId, imageId } = req.params;

//       // Find the product
//       const product = await Product.findById(productId);
//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: "Product not found",
//         });
//       }

//       // Find the image index in the product's images array
//       const imageIndex = product.images.findIndex(
//         (img) => String(img._id) === String(imageId)
//       );
//       if (imageIndex === -1) {
//         return res.status(404).json({
//           success: false,
//           message: "Image not found",
//         });
//       }

//       // Get the image to be deleted
//       const imageToDelete = product.images[imageIndex];

//       // Delete image from Cloudinary storage
//       try {
//         await deleteFromCloudinary(imageToDelete.public_id);
//       } catch (e) {
//         console.warn("Failed to delete image from Cloudinary:", e.message || e);
//       }

//       // Remove image from product's images array
//       product.images.splice(imageIndex, 1);

//       // Save the updated product (without the deleted image)
//       await product.save();

//       // Return success response with updated product
//       res.json({
//         success: true,
//         message: "Image deleted successfully",
//         data: product,
//       });
//     } catch (error) {
//       // Return error response
//       res.status(500).json({
//         success: false,
//         message: "Error deleting image",
//         error: error.message,
//       });
//     }
//   }
// }

// // Export singleton instance of ProductController
// module.exports = new ProductController();

// other

const { validationResult } = require("express-validator");
const { removeUploadedFiles } = require("../middleware/upload");
const Product = require("../models/product.model");
const { uploadToImageKit, deleteFromImageKit } = require("../utils/imageKit");
const fs = require("fs");

// Create new product
const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const {
      productName,
      price,
      description,
      stock,
      categories,
      selectedCategory,
      inStock,
    } = req.body;

    // Parse array fields
    const parsedCategories = Array.isArray(categories)
      ? categories
      : typeof categories === "string"
      ? [categories]
      : [];

    // Upload images to ImageKit
    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const imageData = await uploadToImageKit(file);
          uploadedImages.push(imageData);
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          // Continue with other images even if one fails
        } finally {
          // If multer stored the file on disk, remove that single file (avoid looping req.files repeatedly)
          try {
            if (file && file.path && fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
              console.log(`Removed file: ${file.path}`);
            }
          } catch (e) {
            console.warn(
              `Failed to remove temp file ${file && file.path}:`,
              e.message || e
            );
          }
        }
      }
    }

    // Create product in database
    const product = new Product({
      productName: productName.trim(),
      price: parseFloat(price),
      description: description.trim(),
      stock: parseInt(stock),
      categories: parsedCategories,
      selectedCategory: selectedCategory || "",
      inStock: inStock === "true" || inStock === true,
      images: uploadedImages,
    });

    const savedProduct = await product.save();

    // Populate the response with necessary fields
    const responseProduct = await Product.findById(savedProduct._id)
      .select("-__v")
      .lean();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: responseProduct,
    });

    // if opration failed then remove images from uploads folder
  } catch (error) {
    console.error("Product creation error:", error);

    // remove upload images
    removeUploadedFiles(req);

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product with similar details already exists",
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all products
// Get all products with filtering, pagination, and search capabilities
const getProducts = async (req, res) => {
  try {
    // Extract query parameters with default values
    // page: Current page number (default: 1)
    // limit: Number of items per page (default: 10)
    // category: Filter by specific category
    // search: Search term for product name/description
    const { page = 1, limit = 10, category, search } = req.query;

    // Initialize empty query object - will fetch ALL products regardless of status
    // const query = { status: "active" };
    const query = {};

    // 🔍 FILTER BY CATEGORY
    // If category parameter is provided, filter products that belong to that category
    // Uses MongoDB's $in operator to check if the category exists in the categories array
    if (category) {
      query.categories = { $in: [category] };
      // Example: If category = "Electronics", it finds products where
      // "Electronics" is in the categories array
    }

    // 🔎 SEARCH FUNCTIONALITY
    // If search parameter is provided, search across product name and description
    // Uses MongoDB's $or operator and regex for case-insensitive partial matching
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: "i" } }, // Search in product name
        { description: { $regex: search, $options: "i" } }, // Search in description
      ];
      // $regex: search - creates a regular expression pattern
      // $options: "i" - makes the search case-insensitive
      // Example: search = "phone" will match "iPhone", "Smartphone", "PHONE CASE", etc.
    }

    // 📊 DATABASE QUERY EXECUTION
    // Fetch products with applied filters and pagination
    const products = await Product.find(query) // Apply the constructed query
      .select("-__v") // Exclude the __v field (Mongoose version key)
      .sort({ createdAt: -1 }) // Sort by creation date, newest first (-1 = descending)
      .limit(limit * 1) // Convert limit to number and set max results
      .skip((page - 1) * limit) // Calculate how many documents to skip for pagination
      .lean(); // Return plain JavaScript objects (faster, no Mongoose docs)

    // Example of pagination calculation:
    // If page = 2 and limit = 10: skip = (2-1) * 10 = 10
    // This skips the first 10 results and returns results 11-20

    // 📈 COUNT TOTAL DOCUMENTS FOR PAGINATION
    // Get total number of products matching the query (without pagination)
    const total = await Product.countDocuments(query);
    // This is essential for calculating total pages and pagination metadata

    // Debug log to inspect retrieved products
    console.log(products);

    // ✅ SUCCESS RESPONSE
    res.json({
      success: true,
      data: products, // The actual product data array
      pagination: {
        currentPage: parseInt(page), // Current page number
        totalPages: Math.ceil(total / limit), // Calculate total number of pages
        totalProducts: total, // Total products matching the query
        hasNext: page * limit < total, // Boolean - if there's a next page
        hasPrev: page > 1, // Boolean - if there's a previous page
      },
    });

    // Pagination Example:
    // If total = 45, limit = 10, page = 3:
    // currentPage: 3
    // totalPages: Math.ceil(45/10) = 5
    // totalProducts: 45
    // hasNext: 3*10=30 < 45 = true (there is a next page)
    // hasPrev: 3 > 1 = true (there is a previous page)
  } catch (error) {
    // ❌ ERROR HANDLING
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      // In production, you might want to be more specific:
      // message: error.message || "Failed to fetch products"
    });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("-__v").lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  let newUploadedImages = [];
  let tempFilesToCleanup = [];

  try {
    const {
      productName,
      price,
      description,
      stock,
      categories,
      selectedCategory,
      inStock,
    } = req.body;

    // Input validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      cleanupTempFiles(req.files);
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    // Find existing product
    const product = await Product.findById(req.params.id);
    if (!product) {
      cleanupTempFiles(req.files);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Track temp files for cleanup
    if (req.files) {
      tempFilesToCleanup = [...req.files];
    }

    // Parse removed image ids coming from the client (FormData may provide
    // a string, an array, or multiple form fields). Use helper to normalize.
    const removedImages = parseRemovedImages(req.body?.removedImages);
    const removedIds = (Array.isArray(removedImages)
      ? removedImages
      : [])
      .map((id) => String(id));

    // Handle image removal first (if any ids provided)
    if (removedIds.length > 0) {
      const { imagesToKeep } = await processImageRemoval(
        product.images,
        removedIds
      );
      product.images = imagesToKeep;
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const imageData = await uploadToImageKit(file);

          // Validate ImageKit response
          if (!imageData || !imageData.fileId) {
            throw new Error("Invalid image data received from ImageKit");
          }

          newUploadedImages.push(imageData);
          product.images.push(imageData);
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);

          // Clean up any successfully uploaded images so far
          await cleanupUploadedImages(newUploadedImages);
          cleanupTempFiles(tempFilesToCleanup);

          return res.status(400).json({
            success: false,
            message: `Image upload failed: ${uploadError.message}`,
          });
        }
      }
    }

    // Clean up temp files after successful uploads
    cleanupTempFiles(tempFilesToCleanup);
    tempFilesToCleanup = []; // Clear the array since files are cleaned up

    // Update product fields with proper validation
    if (typeof productName !== "undefined") {
      if (!productName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Product name cannot be empty",
        });
      }
      product.productName = productName.trim();
    }

    if (typeof description !== "undefined") {
      product.description = description ? description.trim() : "";
    }

    if (typeof price !== "undefined") {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid price value",
        });
      }
      product.price = parsedPrice;
    }

    if (typeof stock !== "undefined") {
      const parsedStock = parseInt(stock);
      if (isNaN(parsedStock) || parsedStock < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid stock value",
        });
      }
      product.stock = parsedStock;
    }

    if (typeof categories !== "undefined") {
      product.categories = parseArrayField(categories);
    }

    if (typeof selectedCategory !== "undefined") {
      product.selectedCategory = selectedCategory;
    }

    if (typeof inStock !== "undefined") {
      product.inStock = inStock === "true" || inStock === true;
    }

    // Save updated product to database
    const updatedProduct = await product.save();

    // Return success response with updated product (exclude version key)
    const responseProduct = updatedProduct.toObject();
    delete responseProduct.__v;

    res.json({
      success: true,
      message: "Product updated successfully",
      data: responseProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);

    // Cleanup in case of error
    await cleanupUploadedImages(newUploadedImages);
    cleanupTempFiles(tempFilesToCleanup);

    // Handle specific error types
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Product with this ${field} already exists`,
      });
    }

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Helper functions
const parseRemovedImages = (removedImages) => {
  console.log("removedImages", removedImages);
  if (Array.isArray(removedImages)) return removedImages;
  if (typeof removedImages === "string") {
    try {
      const parsed = JSON.parse(removedImages);
      return Array.isArray(parsed) ? parsed : [removedImages];
    } catch {
      return [removedImages];
    }
  }
  return [];
};

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

const processImageRemoval = async (existingImages, removedIds) => {
  const imagesToKeep = [];
  const imagesToDelete = [];

  for (const image of existingImages) {
    const imageId = image.fileId || image.file_id;

    if (imageId && removedIds.includes(imageId)) {
      imagesToDelete.push(image);
    } else {
      imagesToKeep.push(image);
    }
  }

  // Delete images from ImageKit (best effort)
  for (const image of imagesToDelete) {
    try {
      const fileId = image.fileId || image.file_id;
      if (fileId) {
        await deleteFromImageKit(fileId);
      }
    } catch (error) {
      console.warn(`Failed to delete image from ImageKit:`, error.message);
      // Continue with other deletions
    }
  }

  return { imagesToKeep, imagesToDelete };
};

const cleanupUploadedImages = async (uploadedImages) => {
  for (const image of uploadedImages) {
    try {
      if (image && image.fileId) {
        await deleteFromImageKit(image.fileId);
      }
    } catch (error) {
      console.warn(`Failed to cleanup uploaded image:`, error.message);
    }
  }
};

const cleanupTempFiles = (files = []) => {
  files.forEach((file) => {
    if (file?.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
        console.log(`Cleaned up temp file: ${file.path}`);
      } catch (e) {
        console.warn(`Failed to remove temp file ${file.path}:`, e.message);
      }
    }
  });
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete images from ImageKit (best-effort per-image)
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        try {
          // Some image records may use fileId or file_id depending on uploader
          const fileId =
            image.fileId || image.file_id || image.fileID || image.fileIdString;
          if (fileId) {
            await deleteFromImageKit(fileId);
          } else {
            // If there's no known id, log and continue
            console.warn("No fileId found for image, skipping delete:", image);
          }
        } catch (e) {
          console.warn(
            "Failed to delete image from ImageKit for product",
            req.params.id,
            e.message || e
          );
          // continue deleting other images
        }
      }
    }

    // Delete product from database
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
