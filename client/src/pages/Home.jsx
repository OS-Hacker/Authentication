import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/components/ZodValidation";
import HandleImages from "@/components/HandleImages";

/**
 * Product Schema Validation using Zod
 * Defines the structure and validation rules for product data
 */

// Available category options for the product
const CATEGORY_OPTIONS = ["Electronics", "Clothing", "Books", "Toys"];

const ProductForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      productName: "",
      price: "",
      description: "",
      stock: "",
      categories: [],
      inStock: false,
      images: [],
    },
  });

  // Watch categories for real-time updates
  const selectedCategories = watch("categories");

  const handleCategoryChange = useCallback(
    (category) => {
      const updatedCategories = selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category];

      setValue("categories", updatedCategories);
    },
    [selectedCategories, setValue]
  );

  const onSubmit = useCallback((data) => {
    // Create FormData for potential file upload
    const formData = new FormData();

    // Append basic product fields
    formData.append("productName", data.productName);
    formData.append("price", data.price.toString());
    formData.append("description", data.description);
    formData.append("stock", data.stock.toString());
    formData.append("inStock", data.inStock.toString());

    // Append categories as array
    data.categories.forEach((category) => {
      formData.append("categories[]", category);
    });

    // Append image files
    if (data.images && data.images.length > 0) {
      data.images.forEach((file) => {
        formData.append("images", file);
      });
    }

    // Log submission data for debugging
    console.log("✅ Product Submitted:", {
      productName: data.productName,
      price: data.price,
      description: data.description,
      stock: data.stock,
      categories: data.categories,
      inStock: data.inStock,
      imageCount: data.images ? data.images.length : 0,
      images: data.images,
    });

    // In a real application, you would submit the formData to your API here
    // Example: await fetch('/api/products', { method: 'POST', body: formData });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 py-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg space-y-5"
        noValidate
      >
        {/* Form Header */}
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Add New Product
        </h2>

        {/* Product Name Field */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Product Name
          </label>
          <input
            {...register("productName")}
            type="text"
            placeholder="Enter product name"
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
          {errors.productName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.productName.message}
            </p>
          )}
        </div>

        {/* Price Field */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Price (₹)
          </label>
          <input
            {...register("price", { valueAsNumber: true })}
            type="number"
            placeholder="Enter price"
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
          {errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
          )}
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            rows="3"
            placeholder="Enter product description"
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition resize-none"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Stock Quantity Field */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Stock Quantity
          </label>
          <input
            {...register("stock", { valueAsNumber: true })}
            type="number"
            placeholder="Enter stock quantity"
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
          />
          {errors.stock && (
            <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
          )}
        </div>

        {/* Categories Selection */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Categories
          </label>
          <div className="flex flex-wrap gap-3">
            {CATEGORY_OPTIONS.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  className="accent-blue-500 w-4 h-4"
                />
                <span className="text-gray-700">{category}</span>
              </label>
            ))}
          </div>
          {errors.categories && (
            <p className="text-red-500 text-sm mt-1">
              {errors.categories.message}
            </p>
          )}
        </div>

        {/* In Stock Toggle */}
        <div className="flex items-center gap-2">
          <input
            {...register("inStock")}
            type="checkbox"
            className="accent-green-600 w-4 h-4"
          />
          <label className="text-gray-700 font-medium cursor-pointer">
            Available in Stock
          </label>
        </div>

        {/* images */}
        <HandleImages setValue={setValue} trigger={trigger} errors={errors} />

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-transform"
        >
          Submit Product
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
