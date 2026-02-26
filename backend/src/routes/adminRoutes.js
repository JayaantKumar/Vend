// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Get the latest 50 orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
});

module.exports = router;