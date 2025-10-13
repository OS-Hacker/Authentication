// components/ZodValidation.js - Simpler version
import { z } from "zod";

export const productSchema = z
  .object({
    productName: z.string()
      .min(1, "Product name is required")
      .min(3, "Product name must be at least 3 characters")
      .max(100, "Product name must not exceed 100 characters")
      .trim(),

    price: z.number()
      .min(1, "Price is required")
      .refine((val) => !isNaN(parseFloat(val)) && isFinite(val), {
        message: "Price must be a valid number",
      })
      .refine((val) => parseFloat(val) > 0, {
        message: "Price must be greater than 0",
      })
      .refine((val) => parseFloat(val) <= 999999.99, {
        message: "Price must be less than 1,000,000",
      }),

    description: z.string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must not exceed 500 characters")
      .trim()
      .optional()
      .or(z.literal("")),

    stock: z.number()
      .min(1, "Stock quantity is required")
      .refine((val) => !isNaN(parseInt(val)) && isFinite(val), {
        message: "Stock must be a valid number",
      })
      .refine((val) => parseInt(val) >= 0, {
        message: "Stock cannot be negative",
      })
      .refine((val) => parseInt(val) <= 99999, {
        message: "Stock quantity is too large",
      }),

    categories: z.array(z.string())
      .min(1, "Select at least one category")
      .max(10, "You can select up to 10 categories"),

    inStock: z.boolean().default(false),

    images: z.any()
      .refine(
        (files) => files && files.length > 0,
        "Please upload at least one image for the product"
      )
      .refine(
        (files) => files && files.length <= 5,
        "You can upload maximum 5 images"
      )
      .refine((files) => {
        if (!files || files.length === 0) return true;
        return Array.from(files).every((file) => file.size <= 2 * 1024 * 1024);
      }, "Each image must be less than 2MB")
      .refine((files) => {
        if (!files || files.length === 0) return true;
        return Array.from(files).every((file) =>
          [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif",
          ].includes(file.type)
        );
      }, "Only JPEG, PNG, WebP, and GIF images are supported"),

    SearchAndSelect: z.array(z.string()).optional().default([]),
  })
  .refine(
    (data) => {
      if (data.inStock && parseInt(data.stock) <= 0) {
        return false;
      }
      return true;
    },
    {
      message: "Stock must be greater than 0 when product is in stock",
      path: ["stock"],
    }
  );
