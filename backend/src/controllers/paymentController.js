// backend/src/controllers/paymentController.js
const axios = require('axios');
const crypto = require('crypto');

// Cashfree Environment URLs
const CF_API_URL = process.env.CASHFREE_ENV === 'PRODUCTION' 
  ? 'https://api.cashfree.com/pg/orders' 
  : 'https://sandbox.cashfree.com/pg/orders';

const CF_HEADERS = {
  'x-client-id': process.env.CASHFREE_APP_ID,
  'x-client-secret': process.env.CASHFREE_SECRET_KEY,
  'x-api-version': '2022-09-01',
  'Content-Type': 'application/json',
};

/**
 * 1. Create a Payment Order
 */
exports.createOrder = async (req, res) => {
  try {
    const { amount, customerPhone, items } = req.body;

    // Generate a unique order ID for this transaction
    const orderId = `VH_ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const orderPayload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: `CUST_${Date.now()}`,
        customer_phone: customerPhone || "9999999999", // Kiosk might not have a phone, use dummy
      },
      order_meta: {
        // This is where Cashfree sends the success/failure ping
        notify_url: "https://your-public-server.com/api/payments/webhook"
      },
      order_tags: {
        machine_id: "vm_001" // Identifies which kiosk this came from
      }
    };

    const response = await axios.post(CF_API_URL, orderPayload, { headers: CF_HEADERS });

    // Send the payment session data back to the Electron Kiosk
    res.status(200).json({
      success: true,
      orderId: orderId,
      paymentSessionId: response.data.payment_session_id,
      // Cashfree often returns a direct UPI QR link here depending on your account setup
    });

  } catch (error) {
    console.error("Cashfree Order Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to generate order' });
  }
};

/**
 * 2. Verify Cashfree Webhook (The Callback)
 * This is triggered by Cashfree automatically when a user pays.
 */
exports.verifyWebhook = (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const rawBody = req.rawBody; // We need the raw buffer for signature verification

    // 1. Reconstruct the signature payload
    const payload = timestamp + rawBody;

    // 2. Generate our own signature using the secret key
    const expectedSignature = crypto
      .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
      .update(payload)
      .digest('base64');

    // 3. Compare signatures to prevent fake payment injections
    if (signature === expectedSignature) {
      const webhookData = JSON.parse(rawBody);
      
      if (webhookData.data.payment.payment_status === 'SUCCESS') {
        const orderId = webhookData.data.order.order_id;
        console.log(`✅ Payment Verified for Order: ${orderId}`);
        
        // TODO: Update MongoDB order status to 'PAID'
        // TODO: Trigger MQTT to Raspberry Pi to start dispensing
        
        res.status(200).send('Webhook Received & Verified');
      } else {
        console.log('Payment Failed or Pending');
        res.status(200).send('Webhook Received - Not Success');
      }
    } else {
      console.error('🚨 ALERT: Invalid Webhook Signature Detected!');
      res.status(403).send('Invalid Signature');
    }
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send("Internal Server Error");
  }
};