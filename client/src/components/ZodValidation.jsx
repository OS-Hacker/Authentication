import { z } from "zod";

export const productSchema = z.object({
  productName: z.string().min(3, "Product name must be at least 3 characters"),
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(200, "Description must not exceed 200 characters"),
  stock: z
    .number({ invalid_type_error: "Stock must be a number" })
    .int("Stock must be an integer")
    .nonnegative("Stock cannot be negative"),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  inStock: z.boolean(),
  images: z
    .any()
    .refine(
      (files) => files && files.length === 5,
      "Please upload exactly 5 images for the product"
    )
    .refine(
      (files) =>
        Array.from(files).every((file) => file.size <= 2 * 1024 * 1024),
      "Each image must be less than 2MB"
    ),
});
