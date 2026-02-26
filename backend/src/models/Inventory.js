// backend/src/models/Inventory.js
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  machineId: { 
    type: String, 
    required: true, 
    index: true // Indexed because we will query this frequently per machine
  },
  ingredientId: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['BASE', 'ADDON', 'LIQUID'], 
    required: true 
  },
  currentStockGrams: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  lowStockThreshold: { 
    type: Number, 
    default: 500 // Alert admin when stock falls below 500g
  },
  motorChannel: { 
    type: Number, 
    required: true // Which relay/stepper controls this ingredient
  },
  pricing: {
    costPerGram: { type: Number, required: true }, // For profit calculation
    sellingPricePerGram: { type: Number, required: true }
  },
  isActive: { 
    type: Boolean, 
    default: true // If a motor breaks, admin can set this to false to hide it from UI
  }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);