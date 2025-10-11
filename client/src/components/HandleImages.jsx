import React, { useCallback, useEffect, useRef, useState } from "react";

const HandleImages = ({ setValue, trigger ,errors}) => {
  // Constants for image validation
  const IMAGE_CONFIG = {
    MAX_COUNT: 5,
    MAX_SIZE: 2 * 1024 * 1024, // 2MB in bytes
  };
  // State for image preview URLs
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);
  /**
   * Validates file constraints before processing
   * @param {FileList} files - Files to validate
   * @returns {boolean} - True if validation passes
   */
  const validateFiles = useCallback(
    (files) => {
      const fileArray = Array.from(files);

      // Check total file count
      const totalAfterAdd = previewImages.length + fileArray.length;
      if (totalAfterAdd > IMAGE_CONFIG.MAX_COUNT) {
        alert(
          `You can only upload ${IMAGE_CONFIG.MAX_COUNT} images total. You already have ${previewImages.length} images.`
        );
        return false;
      }

      // Check individual file sizes
      const oversizedFiles = fileArray.filter(
        (file) => file.size > IMAGE_CONFIG.MAX_SIZE
      );
      if (oversizedFiles.length > 0) {
        alert("Some files exceed the 2MB size limit");
        return false;
      }

      return true;
    },
    [previewImages.length]
  );

  /**
   * Processes and adds new images to preview and form data
   * @param {FileList} newFiles - New files to add
   */
  const processNewImages = useCallback(
    (newFiles) => {
      const fileArray = Array.from(newFiles);

      // Create preview objects with unique IDs
      const newPreviews = fileArray.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9), // Unique ID for React keys
      }));

      // Update preview images state
      const allPreviews = [...previewImages, ...newPreviews];
      setPreviewImages(allPreviews);

      // Update form value with all files
      const allFiles = allPreviews.map((preview) => preview.file);
      setValue("images", allFiles);

      // Trigger validation
      trigger("images");
    },
    [previewImages, setValue, trigger]
  );

  const handleImageChange = useCallback(
    (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Validate before processing
      if (!validateFiles(files)) {
        e.target.value = "";
        return;
      }

      processNewImages(files);

      // Reset file input for future selections
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [validateFiles, processNewImages]
  );

  /**
   * Handles adding more images to existing selection
   * @param {React.ChangeEvent<HTMLInputElement>} e - Change event
   */
  const handleAddMoreImages = useCallback(
    (e) => {
      const newFiles = e.target.files;
      if (!newFiles || newFiles.length === 0) return;

      // Validate before processing
      if (!validateFiles(newFiles)) {
        e.target.value = "";
        return;
      }

      processNewImages(newFiles);
      e.target.value = ""; // Reset input
    },
    [validateFiles, processNewImages]
  );

  /**
   * Removes an image from preview and form data
   * @param {string} imageUrl - URL of the image to remove
   */
  const handleRemoveImage = useCallback(
    (imageUrl) => {
      const imageIndex = previewImages.findIndex((img) => img.url === imageUrl);

      if (imageIndex === -1) return;

      // Filter out the removed image
      const updatedPreviews = previewImages.filter((_, i) => i !== imageIndex);
      setPreviewImages(updatedPreviews);

      // Update form with remaining files
      const remainingFiles = updatedPreviews.map((preview) => preview.file);
      setValue("images", remainingFiles);

      // Clean up the revoked URL after DOM update
      setTimeout(() => {
        URL.revokeObjectURL(imageUrl);
      }, 100);

      // Trigger validation update
      trigger("images");
    },
    [previewImages, setValue, trigger]
  );

  /**
   * Clean up object URLs when component unmounts
   * Prevents memory leaks
   */
  useEffect(() => {
    return () => {
      previewImages.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, [previewImages]);

  return (
    <>
      {/* Image Upload Section */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Product Images (max 5) - {previewImages.length}/5 selected
        </label>

        {/* File Drop Zone */}
        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-blue-400 rounded-xl p-6 cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors">
          <span className="text-blue-600 font-medium mb-1">
            Click or Drag & Drop images
          </span>
          <span className="text-xs text-gray-500 text-center">
            Up to 5 images, max 2MB each
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="hidden"
          />
        </label>

        {/* Image Validation Error */}
        {errors.images && (
          <p className="text-red-500 text-sm mt-1">{errors.images.message}</p>
        )}

        {/* Image Preview Grid */}
        {previewImages.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Preview ({previewImages.length}/5 images):
            </p>
            <div className="grid grid-cols-5 gap-2">
              {previewImages.map((img) => (
                <div
                  key={img.id}
                  className="relative group border rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={img.url}
                    alt={`Product preview ${img.id}`}
                    className="w-full h-20 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.url)}
                    className="absolute top-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Empty slots for additional images */}
              {Array.from({
                length: IMAGE_CONFIG.MAX_COUNT - previewImages.length,
              }).map((_, index) => (
                <label
                  key={`empty-slot-${index}`}
                  className="border-2 border-dashed border-gray-300 rounded-lg h-20 flex items-center justify-center text-gray-400 text-sm bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors"
                  htmlFor="add-more-images"
                >
                  +
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Hidden input for adding more images */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleAddMoreImages}
          id="add-more-images"
          className="hidden"
        />
      </div>
    </>
  );
};

export default HandleImages;
