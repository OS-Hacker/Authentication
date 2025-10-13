import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Image as ImageIcon, Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// 🔧 Image Configuration Constants
const IMAGE_CONFIG = {
  MAX_COUNT: 5,
  MAX_SIZE: 2 * 1024 * 1024, // 2MB
  ACCEPTED_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ],
};

// 🏭 Main Component
const HandleImages = ({
  setValue,
  trigger,
  errors,
  disabled = false,
  resetTrigger
}) => {
  const [previewImages, setPreviewImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // 🧹 Reset on successful submission
  useEffect(() => {
    if (resetTrigger) {
      previewImages.forEach((img) => URL.revokeObjectURL(img.url));
      setPreviewImages([]);
    }
  }, [resetTrigger, previewImages]);

  // 🧠 Process & Preview Images - Let Zod handle validation
  const processNewImages = useCallback(
    (newFiles) => {
      const fileArray = Array.from(newFiles);

      const newPreviews = fileArray.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      }));

      const allPreviews = [...previewImages, ...newPreviews];
      setPreviewImages(allPreviews);

      // Update form value - Zod will handle validation
      const allFiles = allPreviews.map((p) => p.file);
      setValue("images", allFiles, { shouldValidate: true });

      trigger("images");
    },
    [previewImages, setValue, trigger]
  );

  // 🗑 Remove Single Image
  const handleRemoveImage = useCallback(
    (id) => {
      const imgToRemove = previewImages.find((i) => i.id === id);
      if (!imgToRemove) return;

      URL.revokeObjectURL(imgToRemove.url);

      const updated = previewImages.filter((i) => i.id !== id);
      setPreviewImages(updated);

      // Update form value - Zod will handle validation
      const remainingFiles = updated.map((i) => i.file);
      setValue("images", remainingFiles, { shouldValidate: true });

      trigger("images");
    },
    [previewImages, setValue, trigger]
  );

  // 🧹 Remove All
  const handleRemoveAll = useCallback(() => {
    previewImages.forEach((i) => URL.revokeObjectURL(i.url));
    setPreviewImages([]);
    setValue("images", [], { shouldValidate: true });
    trigger("images");
  }, [previewImages, setValue, trigger]);

  // 🧭 Drag Events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files?.length > 0) {
      processNewImages(files);
    }
  };

  // Handle file input change
  const handleImageChange = useCallback(
    (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      processNewImages(files);
      e.target.value = ""; // Reset input
    },
    [processNewImages]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      previewImages.forEach((i) => URL.revokeObjectURL(i.url));
    };
  }, [previewImages]);

  const canAddMore = previewImages.length < IMAGE_CONFIG.MAX_COUNT;
  const displayError = errors?.images?.message;

  // ✅ reset image state whenever resetTrigger changes
  useEffect(() => {
    // setImages([]);
    setValue("images", []);
  }, [resetTrigger, setValue]);

  console.log("errors");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium">Product Images</Label>
          <Badge variant="secondary" className="text-xs">
            {previewImages.length}/{IMAGE_CONFIG.MAX_COUNT}
          </Badge>
        </div>

        {previewImages.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemoveAll}
            disabled={disabled}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Remove All
          </Button>
        )}
      </div>

      {/* Drop Zone */}
      {canAddMore && (
        <Card
          ref={dropZoneRef}
          className={cn(
            "border-2 border-dashed transition-colors",
            isDragging && "border-primary bg-primary/5",
            !isDragging &&
              "border-muted-foreground/25 hover:border-muted-foreground/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <CardContent className="p-6">
            <label
              htmlFor="product-images"
              className="flex flex-col items-center justify-center space-y-3 text-center cursor-pointer"
            >
              <Button
                type="button"
                size="sm"
                disabled={disabled}
                onClick={(e) => {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Select Images
              </Button>
            </label>

            <input
              type="file"
              multiple
              accept={IMAGE_CONFIG.ACCEPTED_TYPES.join(",")}
              onChange={handleImageChange}
              ref={fileInputRef}
              id="product-images"
              disabled={disabled}
              className="hidden"
            />
          </CardContent>
        </Card>
      )}

      {/* Image Preview Grid */}
      {previewImages.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Image Previews</Label>
            <span className="text-xs text-muted-foreground">
              {previewImages.length} image
              {previewImages.length !== 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {previewImages.map((img) => (
              <Card key={img.id} className="group relative overflow-hidden">
                <CardContent className="p-2">
                  <div className="aspect-square relative rounded-md overflow-hidden bg-muted">
                    <img
                      src={img.url}
                      alt={`Product preview ${img.name}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Remove button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(img.id)}
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    {/* Image info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="truncate">{img.name}</p>
                      <p className="text-muted">{img.size}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add more button */}
            {canAddMore && (
              <Card className="border-dashed">
                <CardContent className="p-2">
                  <label
                    htmlFor="add-more-images"
                    className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
                  >
                    <Plus className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground text-center">
                      Add More
                    </span>
                  </label>

                  <input
                    type="file"
                    multiple
                    accept={IMAGE_CONFIG.ACCEPTED_TYPES.join(",")}
                    onChange={handleImageChange}
                    id="add-more-images"
                    disabled={disabled}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(HandleImages);
