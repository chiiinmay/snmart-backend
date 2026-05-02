const express = require('express');
const multer = require('multer');
const router = express.Router();
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');

// Use memory storage (buffer) for Cloudinary upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = file.mimetype.startsWith('image/');
  if (mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Upload to Cloudinary or return base64 data URL
async function uploadToCloud(fileBuffer, mimetype) {
  try {
    // Try Cloudinary if configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'placeholder') {
      const cloudinary = require('../config/cloudinary');
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'snmart-products', resource_type: 'image' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(fileBuffer);
      });
    }
  } catch (e) {
    console.log('Cloudinary not available, using data URL fallback');
  }

  // Fallback: return base64 data URL (stored in MongoDB)
  const base64 = fileBuffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
}

// @desc    Upload single image
// @route   POST /api/upload/image
router.post('/image', auth, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const url = await uploadToCloud(req.file.buffer, req.file.mimetype);
    res.json({ success: true, url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
router.post('/images', auth, admin, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }
    const urls = await Promise.all(
      req.files.map(file => uploadToCloud(file.buffer, file.mimetype))
    );
    res.json({ success: true, urls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
