// backend/src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Route to create a new order (Called by Electron Kiosk)
router.post('/create', paymentController.createOrder);

// Route for Cashfree to ping when payment succeeds
// Note: We need the raw body for signature verification, so we don't use standard express.json() here
router.post(
  '/webhook', 
  express.raw({ type: 'application/json' }), // Preserves raw buffer
  (req, res, next) => {
    req.rawBody = req.body;
    next();
  },
  paymentController.verifyWebhook
);

export default router;