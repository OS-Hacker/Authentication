// components/CreateProduct.jsx
import React, { useCallback, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/components/ZodValidation";
import { api } from "@/services/Api";
import HandleImages from "@/components/HandleImages";
import CommandDemo from "@/components/Command";

const CATEGORY_OPTIONS = [
  "Electronics",
  "Clothing",
  "Books",
  "Toys",
  "Home",
  "Sports",
];

const CreateProduct = () => {
  const [selectedValue, setSelectedValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form configuration
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    trigger,
    reset,
    setError,
    clearErrors,
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
    mode: "onChange",
  });

  const selectedCategories = watch("categories");

  // Memoized values
  const formTitle = useMemo(
    () => (editingProduct ? "Edit Product" : "Add New Product"),
    [editingProduct]
  );

  const submitButtonText = useMemo(
    () =>
      saving
        ? "Saving..."
        : editingProduct
        ? "Update Product"
        : "Create Product",
    [saving, editingProduct]
  );

  // Category handlers
  const handleCategoryChange = useCallback(
    (category) => {
      const updatedCategories = selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category];

      setValue("categories", updatedCategories, { shouldValidate: true });
    },
    [selectedCategories, setValue]
  );

  const handleCommandSelect = useCallback(
    (category) => {
      setSelectedValue(category);

      // Also add to categories if not already present
      setValue(
        "categories",
        (prev) => {
          if (!prev.includes(category)) {
            return [...prev, category];
          }
          return prev;
        },
        { shouldValidate: true }
      );
    },
    [setValue]
  );

  // Cancel edit handler
  const handleCancelEdit = useCallback(() => {
    if (
      isDirty &&
      !window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      )
    ) {
      return;
    }
    reset();
    setEditingProduct(null);
    setSelectedValue("");
    clearErrors();
  }, [reset, isDirty, clearErrors]);

  // Form submission with proper error handling
  const onSubmit = useCallback(
    async (data) => {
      setSaving(true);
      try {
        const formData = new FormData();

        // Append basic fields with validation
        formData.append("productName", data.productName.trim());
        formData.append("price", parseFloat(data.price).toFixed(2));
        formData.append("description", (data.description || "").trim());
        formData.append("stock", parseInt(data.stock));
        formData.append("inStock", Boolean(data.inStock));

        if (selectedValue) {
          formData.append("selectedValue", selectedValue);
        }

        // Append categories
        (data.categories || []).forEach((category) =>
          formData.append("categories", category)
        );

        // Append images with validation
        if (data.images && data.images.length > 0) {
          data.images.forEach((file) => {
            if (file instanceof File) {
              formData.append("images", file);
            }
          });
        }

        let response;
        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000, // 30 second timeout
        };

        if (editingProduct) {
          response = await api.put(
            `/products/${editingProduct._id}`,
            formData,
            config
          );
        } else {
          response = await api.post("/products", formData, config);
        }

        if (response?.data?.success) {
          // Success handling
          reset();
          setSelectedValue("");
          setEditingProduct(null);

          // Show success message (replace with toast in production)
          console.log(
            editingProduct
              ? "Product updated successfully!"
              : "Product created successfully!"
          );
        } else {
          throw new Error(response?.data?.message || "Save operation failed");
        }
      } catch (error) {
        console.error("Save error:", error);

        // Enhanced error handling
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to save product. Please try again.";

        // Set form errors if available from backend
        if (error.response?.data?.errors) {
          error.response.data.errors.forEach((err) => {
            setError(err.path, { type: "server", message: err.message });
          });
        } else {
          // Set generic error
          setError("root", { type: "server", message: errorMessage });
        }
      } finally {
        setSaving(false);
      }
    },
    [selectedValue, editingProduct, reset, setError]
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Form */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6 sticky top-6"
            noValidate
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{formTitle}</h2>
              {editingProduct && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* Root Error Display */}
            {errors.root && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.root.message}</p>
              </div>
            )}

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                {...register("productName")}
                type="text"
                placeholder="Enter product name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={saving}
              />
              {errors.productName && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.productName.message}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) *
              </label>
              <input
                {...register("price", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Price must be positive" },
                })}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={saving}
              />
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register("description")}
                rows="4"
                placeholder="Enter product description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={saving}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                {...register("stock", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Stock cannot be negative" },
                })}
                type="number"
                min="0"
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={saving}
              />
              {errors.stock && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.stock.message}
                </p>
              )}
            </div>

            {/* Categories Checkboxes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORY_OPTIONS.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={saving}
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
              {errors.categories && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.categories.message}
                </p>
              )}
            </div>

            {/* Command Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Categories
              </label>
              <CommandDemo
                setValue={handleCommandSelect}
                selectedValue={selectedValue}
                setSelectedValue={setSelectedValue}
                disabled={saving}
              />
            </div>

            {/* In Stock Toggle */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                {...register("inStock")}
                type="checkbox"
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              />
              <label className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                Available in Stock
              </label>
            </div>

            {/* Image Upload */}
            <HandleImages
              setValue={setValue}
              trigger={trigger}
              errors={errors}
              existingImages={editingProduct?.images || []}
              disabled={saving}
              isEditing={!!editingProduct}
            />

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving || (!isDirty && !editingProduct)}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {submitButtonText}
              </button>
            </div>

            {/* Form Status */}
            {editingProduct && (
              <div className="text-xs text-gray-500 text-center">
                Editing: {editingProduct.productName}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CreateProduct);
