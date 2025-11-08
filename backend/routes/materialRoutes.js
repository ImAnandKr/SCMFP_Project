const express = require('express');
const router = express.Router();
const { protect, isFaculty, isStudent } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const materialController = require('../controllers/materialController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Upload material (faculty only)
router.post('/upload', protect, isFaculty, upload.single('file'), materialController.uploadMaterial);

// List materials for section/subject (faculty or student)
router.get('/list', protect, materialController.listMaterials);

// Get material details
router.get('/:id', protect, materialController.getMaterial);

module.exports = router;
