const Product = require("../models/product.model");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
const fs = require("fs");

/**
 * ProductController Class
 *
 * Handles all product-related CRUD operations including:
 * - Create, Read, Update, Delete products
 * - Image upload and management with Cloudinary
 * - Pagination and filtering
 * - Error handling and validation
 */
class ProductController {
  /**
   * CREATE PRODUCT
   *
   * Creates a new product with image upload to Cloudinary
   * Preserves existing images while adding new ones
   *
   * @param {Object} req - Express request object
   * @param {Object} req.body - Product data
   * @param {Array} req.files - New image files to upload
   * @param {Object} res - Express response object
   */
  async createProduct(req, res) {
    try {
      // Destructure product data from request body
      const {
        productName,
        description,
        price,
        categories,
        selectedValue,
        stock,
      } = req.body;

      // Handle image uploads to Cloudinary
      const imageUploads = [];
      if (req.files && req.files.length > 0) {
        // Process each uploaded file
        for (const file of req.files) {
          // Upload file to Cloudinary and get result
          const result = await uploadToCloudinary(file.path);

          // Store Cloudinary response data
          imageUploads.push({
            public_id: result.public_id, // Cloudinary public ID for future operations
            url: result.secure_url, // Secure URL for accessing the image
          });

          // Remove file from local server storage after upload
          fs.unlinkSync(file.path);
        }
      }

      // Create new product instance with uploaded data
      const product = new Product({
        productName,
        description,
        price: price ? parseFloat(price) : 0,
        categories: Array.isArray(categories)
          ? categories
          : categories
          ? [categories]
          : [],
        selectedValue: selectedValue || null,
        stock: stock ? parseInt(stock) : 0,
        images: imageUploads,
      });

      // Save product to database
      await product.save();

      // Return success response with created product data
      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      // Clean up uploaded files if error occurs during process
      if (req.files) {
        req.files.forEach((file) => {
          try {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          } catch (e) {
            // ignore cleanup errors
          }
        });
      }

      // Return error response
      res.status(500).json({
        success: false,
        message: "Error creating product",
        error: error.message,
      });
    }
  }

  /**
   * GET ALL PRODUCTS (with pagination)
   *
   * Retrieves all active products with pagination support
   * Includes pagination metadata in response
   *
   * @param {Object} req - Express request object
   * @param {Object} req.query - Query parameters (page, limit)
   * @param {Object} res - Express response object
   */
  async getProducts(req, res) {
    try {
      // Parse pagination parameters with defaults
      const page = parseInt(req.query.page, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
      const skip = (page - 1) * limit; // Calculate documents to skip

      // Fetch products with pagination and sorting
      const query = {}; // add filtering later if needed
      const products = await Product.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      const total = await Product.countDocuments(query);

      // Return success response with products and pagination info
      res.json({
        success: true,
        data: products,
        pagination: {
          page, // Current page
          limit, // Items per page
          total, // Total items in database
          pages: Math.ceil(total / limit), // Total pages
        },
      });
    } catch (error) {
      // Return error response
      res.status(500).json({
        success: false,
        message: "Error fetching products",
        error: error.message,
      });
    }
  }

  /**
   * GET SINGLE PRODUCT
   *
   * Retrieves a specific product by ID
   * Returns 404 if product not found
   *
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Product ID from URL parameters
   * @param {Object} res - Express response object
   */
  async getProduct(req, res) {
    try {
      // Find product by ID
      const product = await Product.findById(req.params.id);

      // Check if product exists
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Return success response with product data
      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      // Return error response
      res.status(500).json({
        success: false,
        message: "Error fetching product",
        error: error.message,
      });
    }
  }

  /**
   * UPDATE PRODUCT
   *
   * Updates an existing product with new data and optional new images
   * Preserves existing images while adding new ones
   *
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Product ID to update
   * @param {Object} req.body - Updated product data
   * @param {Array} req.files - New image files to upload
   * @param {Object} res - Express response object
   */
  async updateProduct(req, res) {
    try {
      // Destructure updated data from request body
      const {
        productName,
        description,
        price,
        categories,
        selectedValue,
        stock,
      } = req.body;
      const productId = req.params.id;

      // Find existing product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Handle new image uploads
      if (req.files && req.files.length > 0) {
        const newImages = [];
        // Process each new image file
        for (const file of req.files) {
          const result = await uploadToCloudinary(file.path);
          newImages.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
          try {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          } catch (e) {}
        }

        // Merge new images with existing ones (preserve existing images)
        product.images = [...product.images, ...newImages];
      }

      // Update product fields only if provided (partial update support)
      if (typeof productName !== "undefined") product.productName = productName;
      if (typeof description !== "undefined") product.description = description;
      if (typeof price !== "undefined") product.price = parseFloat(price);
      if (typeof categories !== "undefined")
        product.categories = Array.isArray(categories)
          ? categories
          : categories
          ? [categories]
          : product.categories;
      if (typeof selectedValue !== "undefined")
        product.selectedValue = selectedValue;
      if (typeof stock !== "undefined") product.stock = parseInt(stock);

      // Save updated product to database
      await product.save();

      // Return success response with updated product
      res.json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      // Clean up uploaded files if error occurs
      if (req.files) {
        req.files.forEach((file) => {
          try {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          } catch (e) {}
        });
      }

      // Return error response
      res.status(500).json({
        success: false,
        message: "Error updating product",
        error: error.message,
      });
    }
  }

  /**
   * DELETE PRODUCT
   *
   * Permanently deletes a product and all associated images from Cloudinary
   *
   * @param {Object} req - Express request object
   * @param {string} req.params.id - Product ID to delete
   * @param {Object} res - Express response object
   */
  async deleteProduct(req, res) {
    try {
      // Find product to be deleted
      const product = await Product.findById(req.params.id);

      // Check if product exists
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Delete all product images from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const image of product.images) {
          try {
            await deleteFromCloudinary(image.public_id);
          } catch (e) {
            // log and continue
            console.warn(
              "Failed to delete image from Cloudinary:",
              e.message || e
            );
          }
        }
      }

      // Remove product from database
      await Product.findByIdAndDelete(req.params.id);

      // Return success response (no data returned for delete operations)
      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      // Return error response
      res.status(500).json({
        success: false,
        message: "Error deleting product",
        error: error.message,
      });
    }
  }

  /**
   * DELETE PRODUCT IMAGE
   *
   * Removes a specific image from a product
   * Deletes image from both Cloudinary and database
   *
   * @param {Object} req - Express request object
   * @param {string} req.params.productId - Product ID
   * @param {string} req.params.imageId - Image ID to delete
   * @param {Object} res - Express response object
   */
  async deleteProductImage(req, res) {
    try {
      const { productId, imageId } = req.params;

      // Find the product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Find the image index in the product's images array
      const imageIndex = product.images.findIndex(
        (img) => String(img._id) === String(imageId)
      );
      if (imageIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Image not found",
        });
      }

      // Get the image to be deleted
      const imageToDelete = product.images[imageIndex];

      // Delete image from Cloudinary storage
      try {
        await deleteFromCloudinary(imageToDelete.public_id);
      } catch (e) {
        console.warn("Failed to delete image from Cloudinary:", e.message || e);
      }

      // Remove image from product's images array
      product.images.splice(imageIndex, 1);

      // Save the updated product (without the deleted image)
      await product.save();

      // Return success response with updated product
      res.json({
        success: true,
        message: "Image deleted successfully",
        data: product,
      });
    } catch (error) {
      // Return error response
      res.status(500).json({
        success: false,
        message: "Error deleting image",
        error: error.message,
      });
    }
  }
}

// Export singleton instance of ProductController
module.exports = new ProductController();
