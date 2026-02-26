// backend/src/models/Ad.js
const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['image', 'video'], 
    required: true 
  },
  url: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: Number, 
    default: 8000 // 8 seconds default
  }
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);