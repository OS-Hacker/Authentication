const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // accept images only
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Function to remove uploaded files
const removeUploadedFiles = (req) => {
  if (req.files) {
    // Handle multiple files
    req.files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
        console.log(`Removed file: ${file.path}`);
      }
    });
  } else if (req.file) {
    // Handle single file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log(`Removed file: ${req.file.path}`);
    }
  }
};

// Function to remove specific files by their paths
const removeFilesByPaths = (filePaths) => {
  filePaths.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Removed file: ${filePath}`);
    }
  });
};

// Middleware to handle file cleanup on errors
const cleanupOnError = (req, res, next) => {
  // Store original send method
  const originalSend = res.send;

  // Override send method to handle cleanup
  res.send = function (data) {
    // If response status is error (4xx or 5xx), clean up files
    if (res.statusCode >= 400) {
      removeUploadedFiles(req);
    }
    
    // Call original send method
    return originalSend.call(this, data);
  };

  next();
};

module.exports = {
  upload,
  removeUploadedFiles,
  removeFilesByPaths,
  cleanupOnError
};