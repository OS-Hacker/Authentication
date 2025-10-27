import React, { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/services/Api";
import HandleImages from "@/components/HandleImages";
import CommandDemo from "@/components/Command";
import toast from "react-hot-toast";

// Shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { productSchema } from "@/components/ZodValidation";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const editingProduct = location.state?.product || null;
  const editMode = Boolean(params?.id || editingProduct);

  // Form configuration
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    trigger,
    reset,
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
      SearchAndSelect: [],
      removedImages: [],
    },
    mode: "onChange",
  });

  // Watch form state
  const selectedCategories = watch("categories");
  const inStockValue = watch("inStock");
  const stockQuantity = watch("stock");

  // reset images
  const [resetImages, setResetImages] = useState(false); // ✅ new
  // initial images for edit mode
  const [initialImages, setInitialImages] = useState([]);

  // Category handlers
  const handleCategoryChange = useCallback(
    (category) => {
      const updatedCategories = selectedCategories?.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...(selectedCategories || []), category];

      setValue("categories", updatedCategories, { shouldValidate: true });
    },
    [selectedCategories, setValue]
  );

  // handle Search / CommandDemo
  const handleCommandSelect = useCallback(
    (category) => {
      setSelectedValue(category);

      // Also add to categories if not already present
      if (!selectedCategories?.includes(category)) {
        const updatedCategories = [...(selectedCategories || []), category];
        setValue("categories", updatedCategories, { shouldValidate: true });
      }
    },
    [selectedCategories, setValue]
  );

  // Remove category
  const removeCategory = useCallback(
    (categoryToRemove) => {
      const updatedCategories = (selectedCategories || []).filter(
        (category) => category !== categoryToRemove
      );
      setValue("categories", updatedCategories, { shouldValidate: true });
    },
    [selectedCategories, setValue]
  );

  // Handle stock quantity change
  const handleStockChange = useCallback(
    (e) => {
      const value = e.target.value;
      setValue("stock", value, { shouldValidate: true });

      // Auto-update inStock based on stock quantity
      const stockNum = parseInt(value) || 0;
      if (stockNum > 0 && !inStockValue) {
        setValue("inStock", true, { shouldValidate: true });
      } else if (stockNum === 0 && inStockValue) {
        setValue("inStock", false, { shouldValidate: true });
      }
    },
    [inStockValue, setValue]
  );

  // Handle inStock toggle
  const handleInStockToggle = useCallback(
    (checked) => {
      setValue("inStock", checked, { shouldValidate: true });

      // If setting to inStock but stock is 0, set stock to 1
      if (checked && (!stockQuantity || parseInt(stockQuantity) === 0)) {
        setValue("stock", "1", { shouldValidate: true });
      }
    },
    [stockQuantity, setValue]
  );

  // Form submission with proper error handling
  const onSubmit = useCallback(
    async (data) => {
      setSaving(true);

      const formData = new FormData();

      // Append basic fields with validation
      formData.append("productName", data.productName.trim());
      formData.append("price", parseFloat(data.price).toFixed(2));
      formData.append("description", (data.description || "").trim());
      formData.append("stock", parseInt(data.stock) || 0);
      formData.append("inStock", Boolean(data.inStock));

      if (selectedValue) {
        formData.append("SearchAndSelect", selectedValue);
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

      // Append removed remote image ids (for update operations)
      if (data.removedImages && data.removedImages.length > 0) {
        (data.removedImages || []).forEach((id) =>
          formData.append("removedImages", id)
        );
      }

      try {
        let response;

        if (editMode && (params?.id || editingProduct?._id)) {
          const id = params?.id || editingProduct._id;
          response = await api.put(`/${id}`, formData);
        } else {
          response = await api.post("/create-product", formData);
        }

        if (response?.data?.success) {
          const successMessage = editMode
            ? "Product updated successfully!"
            : "Product created successfully!";
          toast.success(successMessage);
          reset();
          setSelectedValue("");
          setResetImages((prev) => !prev); // trigger image reset

          if (editMode) {
            // navigate back to list after edit
            navigate("/dashboard/products/all");
          }
        } else {
          throw new Error(response?.data?.message || "Save operation failed");
        }
      } catch (error) {
        console.error("Save error:", error);
        toast.error(
          error.response?.data?.message ||
            (editMode ? "Failed to update product" : "Failed to create product")
        );
      } finally {
        setSaving(false);
      }
    },
    [selectedValue, reset, editMode, params, editingProduct, navigate]
  );

  // Prefill form in edit mode (if product passed in navigation state)
  useEffect(() => {
    if (editingProduct) {
      const p = editingProduct;
      setValue("productName", p.productName || "");
      setValue("price", p.price || "");
      setValue("description", p.description || "");
      setValue("stock", p.stock || "0");
      setValue("categories", p.categories || []);
      setValue("inStock", !!p.inStock);
      setSelectedValue(p.selectedCategory || p.selectedValue || "");

      // Map existing images (remote) to initialImages structure used by HandleImages
      if (Array.isArray(p.images) && p.images.length > 0) {
        const imgs = p.images.map((img) => ({
          id:
            img.fileId ||
            img.file_id ||
            img.public_id ||
            img._id ||
            Math.random().toString(36).slice(2),
          url: img.url || img.secure_url || img.thumbnail || img.filePath,
          remote: true,
        }));
        setInitialImages(imgs);
      }
    }
  }, [editingProduct, setValue]);

  // Calculate stock status
  const stockStatus = stockQuantity ? parseInt(stockQuantity) : 0;
  const isOutOfStock = stockStatus === 0;
  const isLowStock = stockStatus > 0 && stockStatus <= 10;

  return (
    <div className="min-h-screenpy-4 sm:py-6 lg:py-8">
      <div className="container w-full px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg border-border max-w-3xl mx-auto">
          <CardHeader className="pb-6 text-center sm:text-left">
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Create New Product
            </CardTitle>
            <CardDescription className="text-base sm:text-lg mt-2">
              Add a new product to your inventory. All fields marked with * are
              required.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 sm:space-y-8">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 sm:space-y-8"
            >
              {/* Product Name & Price - Side by side on larger screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="productName" className="text-sm font-medium">
                    Product Name *
                  </Label>
                  <Input
                    {...register("productName")}
                    id="productName"
                    type="text"
                    placeholder="Enter product name"
                    disabled={saving}
                    className={
                      errors.productName
                        ? "border-destructive focus:ring-destructive"
                        : ""
                    }
                  />
                  {errors.productName && (
                    <p className="text-destructive text-sm font-medium">
                      {errors.productName.message}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">
                    Price (₹) *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      {...register("price", {
                        valueAsNumber: true,
                        min: { value: 0, message: "Price must be positive" },
                      })}
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      disabled={saving}
                      className={`pl-8 ${
                        errors.price
                          ? "border-destructive focus:ring-destructive"
                          : ""
                      }`}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-destructive text-sm font-medium">
                      {errors.price.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  {...register("description")}
                  id="description"
                  rows="4"
                  placeholder="Enter product description..."
                  disabled={saving}
                  className={
                    errors.description
                      ? "border-destructive focus:ring-destructive"
                      : ""
                  }
                />
                {errors.description && (
                  <p className="text-destructive text-sm font-medium">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Stock Quantity & In Stock Toggle - Side by side on larger screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Stock Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm font-medium">
                    Stock Quantity *
                  </Label>
                  <Input
                    {...register("stock", {
                      valueAsNumber: true,
                      min: { value: 0, message: "Stock cannot be negative" },
                    })}
                    id="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    disabled={saving}
                    onChange={handleStockChange}
                    className={
                      errors.stock
                        ? "border-destructive focus:ring-destructive"
                        : ""
                    }
                  />
                  {errors.stock && (
                    <p className="text-destructive text-sm font-medium">
                      {errors.stock.message}
                    </p>
                  )}

                  {/* Stock Status Indicator */}
                  {stockQuantity !== undefined && stockQuantity !== "" && (
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isOutOfStock
                            ? "bg-destructive"
                            : isLowStock
                            ? "bg-amber-500"
                            : "bg-green-500"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          isOutOfStock
                            ? "text-destructive"
                            : isLowStock
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}
                      >
                        {isOutOfStock
                          ? "Out of stock"
                          : isLowStock
                          ? "Low stock"
                          : "In stock"}
                      </span>
                    </div>
                  )}
                </div>

                {/* In Stock Toggle */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium block mb-2">
                    Availability
                  </Label>
                  <div
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      inStockValue
                        ? "bg-green-50 border-green-200"
                        : "bg-muted/50 border-border"
                    }`}
                  >
                    <Checkbox
                      id="inStock"
                      checked={inStockValue}
                      onCheckedChange={handleInStockToggle}
                      disabled={saving}
                      className={
                        inStockValue
                          ? "data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                          : ""
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor="inStock"
                        className="text-sm font-medium cursor-pointer block"
                      >
                        {inStockValue ? "In Stock" : "Out of Stock"}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {inStockValue
                          ? stockStatus > 10
                            ? `${stockStatus} units available`
                            : stockStatus > 0
                            ? `Only ${stockStatus} units left`
                            : "Product is available for purchase"
                          : "Product is currently unavailable"}
                      </p>
                    </div>
                    {inStockValue && (
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>

              {/* Categories Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <Label className="text-sm font-medium">Categories</Label>
                  <span className="text-xs text-muted-foreground">
                    {selectedCategories?.length || 0} selected
                  </span>
                </div>

                {/* Categories Checkboxes */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORY_OPTIONS.map((category) => (
                    <div
                      key={category}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                        selectedCategories?.includes(category)
                          ? "bg-primary/10 border-primary"
                          : "bg-background border-border hover:bg-muted/50"
                      }`}
                    >
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories?.includes(category)}
                        onCheckedChange={() => handleCategoryChange(category)}
                        disabled={saving}
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm font-normal cursor-pointer flex-1 truncate"
                      >
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>

                {errors.categories && (
                  <p className="text-destructive text-sm font-medium">
                    {errors.categories.message}
                  </p>
                )}

                {/* Selected Categories Badges */}
                {selectedCategories?.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Selected Categories:
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCategories.map((category) => (
                        <Badge
                          key={category}
                          variant="secondary"
                          className="px-3 py-1.5 text-sm flex items-center gap-1 group"
                        >
                          <span>{category}</span>
                          <button
                            type="button"
                            onClick={() => removeCategory(category)}
                            className="ml-1 hover:text-destructive focus:outline-none transition-colors size-4 rounded-full flex items-center justify-center group-hover:bg-destructive/10"
                            disabled={saving}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Command Search */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search Categories</Label>
                <CommandDemo
                  setValue={handleCommandSelect}
                  selectedValue={selectedValue}
                  setSelectedValue={setSelectedValue}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  Search and select additional categories
                </p>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <HandleImages
                  setValue={setValue}
                  resetTrigger={resetImages} // <-- new prop
                  errors={errors}
                  trigger={trigger}
                  disabled={saving}
                  showErrors={false}
                  initialImages={initialImages}
                />
                {errors.images && (
                  <p className="text-destructive text-sm font-medium">
                    {errors.images.message}
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset()}
                  disabled={saving || !isDirty}
                  className="sm:flex-1 order-2 sm:order-1"
                >
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  disabled={saving || !isDirty}
                  className="sm:flex-1 order-1 sm:order-2"
                  size="lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Product...
                    </>
                  ) : (
                    "Create Product"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default React.memo(CreateProduct);
