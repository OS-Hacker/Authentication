// middleware/validation.js
const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

const productsValidations = {
  // product validations
  createProduct: [
    body("productName")
      .notEmpty()
      .withMessage("productName is required")
      .isLength({ min: 3, max: 50 })
      .withMessage("productName name must be between 3 and 50 characters"),
    body("price")
      .notEmpty()
      .withMessage("Price is required")
      .isNumeric()
      .withMessage("Price must be number"),
    body("description")
      .notEmpty()
      .withMessage("description is required")
      .isLength({ min: 3, max: 100 })
      .withMessage("description must be between 1 and 100 characters"),
    body("stock")
      .notEmpty()
      .withMessage("stock is required")
      .withMessage("Price is required")
      .isNumeric(),
  ],
};

module.exports = {
  ...productsValidations,
  handleValidationErrors,
};
