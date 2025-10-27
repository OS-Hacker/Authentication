const express = require("express");
const productController = require("../controllers/product.controller");
const { upload } = require("../middleware/upload");
const productValidation = require("../middleware/validations/productValidation");

const productRouter = express.Router();
// Create product with image upload
productRouter.post(
  "/create-product",
  upload.array("images", 5), // Max 5 images
  // productValidation,
  productValidation.createProduct,
  productController.createProduct
);

// Get all products
productRouter.get("/products", productController.getProducts);

// Get single product
// productRouter.get("/:id", productController.getProduct);

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
// productRouter.delete(
//   "/:productId/images/:imageId",
//   // productController.deleteProductImage
// );

module.exports = productRouter;
