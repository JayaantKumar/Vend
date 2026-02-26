const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Generate the QR session
router.post('/create', paymentController.createOrder);

// The new Polling Route for the Kiosk
router.get('/status/:orderId', paymentController.checkOrderStatus);

module.exports = router;