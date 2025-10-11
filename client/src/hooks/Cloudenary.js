// Frontend side -

import React, { useState } from "react";
import axios from "axios";

/**
 * ProductForm Component
 *
 * A reusable form component for creating and updating products with image upload functionality.
 * Supports multiple image uploads, existing image management, and form validation.
 *
 * @param {Object} props - Component props
 * @param {Object} props.product - Existing product data for editing (optional)
 * @param {Function} props.onSuccess - Callback function called after successful form submission
 * @returns {JSX.Element} Product form component
 */
const ProductForm = ({ product, onSuccess }) => {
  // State for form data with initial values from existing product or empty strings
  const [formData, setFormData] = useState({
    name: product?.name || "", // Product name
    description: product?.description || "", // Product description
    price: product?.price || "", // Product price
    category: product?.category || "", // Product category
    stock: product?.stock || "", // Product stock quantity
  });

  // State for newly selected image files
  const [images, setImages] = useState([]);

  // State for existing product images (for edit mode)
  const [existingImages, setExistingImages] = useState(product?.images || []);

  // Loading state to disable form during API calls
  const [loading, setLoading] = useState(false);

  /**
   * Handles changes in form input fields
   * Updates the formData state with new values while preserving other fields
   *
   * @param {Object} e - Change event from input field
   */
  const handleChange = (e) => {
    setFormData({
      ...formData, // Spread existing form data
      [e.target.name]: e.target.value, // Update the changed field
    });
  };

  /**
   * Handles image file selection
   * Converts FileList to array and updates images state
   *
   * @param {Object} e - Change event from file input
   */
  const handleImageChange = (e) => {
    // Convert FileList to Array and update state
    setImages([...e.target.files]);
  };

  /**
   * Handles form submission
   * Creates FormData object, appends form fields and images,
   * and makes API call to create or update product
   *
   * @param {Object} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true); // Set loading state to true

    try {
      // Create FormData object for multipart/form-data submission
      const data = new FormData();

      // Append all form fields to FormData
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Append each selected image file to FormData
      images.forEach((image) => {
        data.append("images", image); // 'images' field name expected by backend
      });

      let response;

      // Determine if we're updating existing product or creating new one
      if (product) {
        // UPDATE: Send PUT request to update existing product
        response = await axios.put(`/api/products/${product._id}`, data, {
          headers: {
            "Content-Type": "multipart/form-data", // Required for file uploads
          },
        });
      } else {
        // CREATE: Send POST request to create new product
        response = await axios.post("/api/products", data, {
          headers: {
            "Content-Type": "multipart/form-data", // Required for file uploads
          },
        });
      }

      // Call success callback with response data
      onSuccess(response.data);
    } catch (error) {
      // Handle API errors
      console.error("Error saving product:", error);
      alert("Error saving product"); // User-friendly error message
    } finally {
      // Reset loading state regardless of success/error
      setLoading(false);
    }
  };

  /**
   * Handles deletion of existing product images
   * Makes API call to delete image and updates local state
   *
   * @param {string} imageId - ID of the image to delete
   */
  const handleDeleteImage = async (imageId) => {
    try {
      // Send DELETE request to remove specific image
      await axios.delete(`/api/products/${product._id}/images/${imageId}`);

      // Update local state by filtering out deleted image
      setExistingImages(existingImages.filter((img) => img._id !== imageId));
    } catch (error) {
      // Log error but don't show alert to avoid disrupting user experience
      console.error("Error deleting image:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      {/* Product Name Field */}
      <div className="form-group">
        <label htmlFor="name">Product Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter product name"
        />
      </div>

      {/* Product Description Field */}
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
          placeholder="Enter product description"
        />
      </div>

      {/* Price Field */}
      <div className="form-group">
        <label htmlFor="price">Price ($)</label>
        <input
          type="number"
          id="price"
          name="price"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={handleChange}
          required
          placeholder="0.00"
        />
      </div>

      {/* Category Field */}
      <div className="form-group">
        <label htmlFor="category">Category</label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          placeholder="Enter product category"
        />
      </div>

      {/* Stock Quantity Field */}
      <div className="form-group">
        <label htmlFor="stock">Stock Quantity</label>
        <input
          type="number"
          id="stock"
          name="stock"
          min="0"
          value={formData.stock}
          onChange={handleChange}
          required
          placeholder="0"
        />
      </div>

      {/* Image Upload Section */}
      <div className="form-group">
        <label htmlFor="images">Product Images</label>

        {/* File Input for New Images */}
        <input
          type="file"
          id="images"
          multiple // Allow multiple file selection
          accept="image/*" // Restrict to image files only
          onChange={handleImageChange}
        />

        {/* Preview of Existing Images (Edit Mode Only) */}
        <div className="image-preview">
          {existingImages.map((image) => (
            <div key={image._id} className="image-item">
              <img
                src={image.url}
                alt={`Product ${formData.name}`}
                className="preview-image"
              />
              {/* Delete Button for Existing Images */}
              <button
                type="button"
                onClick={() => handleDeleteImage(image._id)}
                className="delete-btn"
                aria-label={`Delete image ${image._id}`}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className={`submit-btn ${loading ? "loading" : ""}`}
      >
        {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
};

export default ProductForm;

// Backend side-

// controllers/productController.js
const Product = require("../models/Product");
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
   * Creates a new product with optional image uploads to Cloudinary
   * Handles file cleanup and error scenarios
   *
   * @param {Object} req - Express request object
   * @param {Object} req.body - Product data from form
   * @param {Array} req.files - Uploaded image files from multer
   * @param {Object} res - Express response object
   */
  async createProduct(req, res) {
    try {
      // Destructure product data from request body
      const { name, description, price, category, stock } = req.body;

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
        name,
        description,
        price: parseFloat(price), // Convert string to float
        category,
        stock: parseInt(stock), // Convert string to integer
        images: imageUploads, // Array of Cloudinary image objects
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
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path); // Remove file from local storage
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
      const page = parseInt(req.query.page) || 1; // Current page number
      const limit = parseInt(req.query.limit) || 10; // Items per page
      const skip = (page - 1) * limit; // Calculate documents to skip

      // Fetch products with pagination and sorting
      const products = await Product.find({ isActive: true }) // Only active products
        .skip(skip) // Skip documents for pagination
        .limit(limit) // Limit number of documents
        .sort({ createdAt: -1 }); // Sort by newest first

      // Get total count for pagination metadata
      const total = await Product.countDocuments({ isActive: true });

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
      const { name, description, price, category, stock } = req.body;
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
          fs.unlinkSync(file.path); // Clean up local file
        }

        // Merge new images with existing ones (preserve existing images)
        product.images = [...product.images, ...newImages];
      }

      // Update product fields only if provided (partial update support)
      if (name) product.name = name;
      if (description) product.description = description;
      if (price) product.price = parseFloat(price);
      if (category) product.category = category;
      if (stock) product.stock = parseInt(stock);

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
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
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
          await deleteFromCloudinary(image.public_id);
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
        (img) => img._id.toString() === imageId
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
      await deleteFromCloudinary(imageToDelete.public_id);

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


// Routes

// routes/products.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require("../middleware/upload");
const {
  productValidation,
  handleValidationErrors,
} = require("../middleware/validation");

// Create product with image upload
router.post(
  "/",
  upload.array("images", 5), // Max 5 images
  productValidation,
  handleValidationErrors,
  productController.createProduct
);

// Get all products
router.get("/", productController.getProducts);

// Get single product
router.get("/:id", productController.getProduct);

// Update product
router.put(
  "/:id",
  upload.array("images", 5),
  productValidation,
  handleValidationErrors,
  productController.updateProduct
);

// Delete product
router.delete("/:id", productController.deleteProduct);

// Delete product image
router.delete(
  "/:productId/images/:imageId",
  productController.deleteProductImage
);

module.exports = router;