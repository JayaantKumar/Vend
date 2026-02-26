const axios = require('axios');
const Order = require('../models/Order');

const CF_HEADERS = {
  'x-client-id': process.env.CASHFREE_CLIENT_ID,
  'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
  'x-api-version': '2022-09-01',
  'Content-Type': 'application/json',
};

const CF_API_URL = process.env.CASHFREE_ENV === 'test' 
  ? 'https://sandbox.cashfree.com/pg/orders'
  : 'https://api.cashfree.com/pg/orders';

// 1. Create Order (Webhook completely removed)
exports.createOrder = async (req, res) => {
  try {
    const { amount, customerPhone, items } = req.body;
    const orderId = `VH_ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const orderPayload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: `CUST_${Date.now()}`,
        customer_phone: customerPhone || "9999999999", 
      },
      order_tags: { machine_id: process.env.MACHINE_ID }
      // Notice: order_meta notify_url is completely gone!
    };

    const response = await axios.post(CF_API_URL, orderPayload, { headers: CF_HEADERS });

    // Save initial Order to MongoDB
    const newOrder = new Order({
      orderId: orderId,
      machineId: process.env.MACHINE_ID,
      status: 'PENDING_PAYMENT',
      items: items, 
      payment: {
        provider: 'Cashfree',
        sessionId: response.data.payment_session_id
      },
      ledger: { totalAmount: amount }
    });
    
    await newOrder.save();
    console.log(`💾 Order ${orderId} saved as PENDING_PAYMENT.`);

    res.status(200).json({
      success: true,
      orderId: orderId,
      paymentSessionId: response.data.payment_session_id,
    });

  } catch (error) {
    console.error("Cashfree Order Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to generate order' });
  }
};

// 2. Poll Order Status (The Kiosk will call this every 3 seconds)
exports.checkOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Ask Cashfree for the live status of this specific order
    const response = await axios.get(`${CF_API_URL}/${orderId}`, { headers: CF_HEADERS });
    const cashfreeStatus = response.data.order_status; // Cashfree returns "PAID" when successful

    // Check if it's already marked as PAID in our DB to prevent double-triggering
    const existingOrder = await Order.findOne({ orderId: orderId });

    if (cashfreeStatus === 'PAID' && existingOrder.status !== 'PAID') {
      // 1. Update our Database
      await Order.findOneAndUpdate({ orderId: orderId }, { status: 'PAID' });
      console.log(`✅ Payment Verified via Polling! DB Updated for Order: ${orderId}`);

      // ---------------------------------------------------------
      // 🛠️ [HARDWARE HANDOVER POINT]
      // Hardware Engineer: 
      // 1. Fetch the custom ingredients for this order from DB
      // 2. Trigger MQTT: mqttClient.publish(`vending/${existingOrder.machineId}/cmd`, dispenseData)
      // ---------------------------------------------------------
    }

    // Send the live status back to the React Kiosk
    res.status(200).json({ success: true, status: cashfreeStatus });

  } catch (error) {
    console.error("Status Check Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to check status' });
  }
};