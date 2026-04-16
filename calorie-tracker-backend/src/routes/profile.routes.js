const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  getDailyGoals,
} = require('../controllers/profile.controller');

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.get('/profile/daily-goals', authMiddleware, getDailyGoals);

module.exports = router;
