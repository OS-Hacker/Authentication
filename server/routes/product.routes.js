const express = require("express");
const productController = require("../controllers/product.controller");
const upload = require("../middleware/upload");
const { handleValidationErrors } = require("../middleware/validation");

const productRouter = express.Router();
// Create product with image upload
productRouter.post(
  "/create-product",
  upload.array("images", 5), // Max 5 images
  // productValidation,
  handleValidationErrors,
  productController.createProduct
);

// Get all products
productRouter.get("/", productController.getProducts);

// Get single product
productRouter.get("/:id", productController.getProduct);

// Update product
productRouter.put(
  "/:id",
  upload.array("images", 5),
  // productValidation,
  // handleValidationErrors,
  productController.updateProduct
);

// Delete product
productRouter.delete("/:id", productController.deleteProduct);

// Delete product image
productRouter.delete(
  "/:productId/images/:imageId",
  productController.deleteProductImage
);

module.exports = productRouter;
