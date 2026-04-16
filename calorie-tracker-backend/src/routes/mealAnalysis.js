const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getEntries,
  analyzeText,
  deleteEntries,
  analyzeMealImageHandler,
} = require('../controllers/mealAnalysis.controller');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

router.get('/entries', authMiddleware, getEntries);
router.post('/analyze-user-text', authMiddleware, analyzeText);
router.delete('/entries', authMiddleware, deleteEntries);
router.post('/analyze-meal-image', authMiddleware, upload.single('meal_image'), analyzeMealImageHandler);

module.exports = router;
