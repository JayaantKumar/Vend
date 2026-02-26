const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  cartItemId: { type: String, required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  addons: { 
    type: Map, 
    of: Number, 
    default: {}
  }
});

const orderSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  machineId: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['CREATED', 'PENDING_PAYMENT', 'PAID', 'DISPENSING', 'COMPLETED', 'FAILED', 'REFUNDED'], 
    default: 'CREATED' 
  },
  items: [orderItemSchema],
  payment: {
    provider: { type: String, default: 'Cashfree' },
    sessionId: { type: String },
    transactionId: { type: String } 
  },
  ledger: {
    totalAmount: { type: Number, required: true },
    platformShare: { type: Number }, 
    gymShare: { type: Number }       
  }
}, { timestamps: true });

// 🛠️ FIX: Removed 'next' for Mongoose v8+ compatibility
orderSchema.pre('save', function() {
  if (this.isModified('ledger.totalAmount') && this.ledger.totalAmount > 0) {
    // Auto-calculate the revenue split
    this.ledger.platformShare = +(this.ledger.totalAmount * 0.10).toFixed(2);
    this.ledger.gymShare = +(this.ledger.totalAmount * 0.90).toFixed(2);
  }
});

module.exports = mongoose.model('Order', orderSchema);