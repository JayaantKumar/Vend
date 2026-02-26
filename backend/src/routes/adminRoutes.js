// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Ad = require('../models/Ad');

// --- ORDERS ---
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- INVENTORY ---
router.get('/inventory', async (req, res) => {
  try {
    const items = await Inventory.find().sort({ type: 1, name: 1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- ADS MANAGEMENT ---
router.get('/ads', async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.status(200).json(ads);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/ads', async (req, res) => {
  try {
    const newAd = new Ad(req.body);
    await newAd.save();
    res.status(201).json(newAd);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create ad' });
  }
});

router.delete('/ads/:id', async (req, res) => {
  try {
    await Ad.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete ad' });
  }
});

module.exports = router;