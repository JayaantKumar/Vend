// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./src/models/Inventory');

const seedInventory = async () => {
  try {
    // Connect to your MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌿 Connected to DB for Seeding...');

    // 1. Clear any old/test inventory data
    await Inventory.deleteMany({});
    console.log('🗑️ Cleared old inventory.');

    // 2. The Master Inventory List
    const initialStock = [
      // --- PROTEIN BASES (5000g capacity) ---
      { machineId: 'vm_001', ingredientId: 'vanilla', name: 'Vanilla Bean', type: 'BASE', currentStockGrams: 5000, lowStockThreshold: 500, motorChannel: 1, pricing: { costPerGram: 1.5, sellingPricePerGram: 2.5 } },
      { machineId: 'vm_001', ingredientId: 'chocolate', name: 'Chocolate Fudge', type: 'BASE', currentStockGrams: 5000, lowStockThreshold: 500, motorChannel: 2, pricing: { costPerGram: 1.5, sellingPricePerGram: 2.5 } },
      { machineId: 'vm_001', ingredientId: 'strawberry', name: 'Strawberry', type: 'BASE', currentStockGrams: 5000, lowStockThreshold: 500, motorChannel: 3, pricing: { costPerGram: 1.5, sellingPricePerGram: 2.5 } },
      { machineId: 'vm_001', ingredientId: 'peanut', name: 'Peanut Protein', type: 'BASE', currentStockGrams: 4200, lowStockThreshold: 500, motorChannel: 4, pricing: { costPerGram: 2.0, sellingPricePerGram: 3.0 } },
      
      // --- BOOSTERS & ADDONS (2000g capacity) ---
      { machineId: 'vm_001', ingredientId: 'creatine', name: 'Creatine', type: 'ADDON', currentStockGrams: 1800, lowStockThreshold: 200, motorChannel: 5, pricing: { costPerGram: 3.0, sellingPricePerGram: 5.0 } },
      { machineId: 'vm_001', ingredientId: 'dryfruits', name: 'Dry Fruits', type: 'ADDON', currentStockGrams: 1500, lowStockThreshold: 200, motorChannel: 6, pricing: { costPerGram: 2.5, sellingPricePerGram: 4.0 } },
      { machineId: 'vm_001', ingredientId: 'oats', name: 'Rolled Oats', type: 'ADDON', currentStockGrams: 2000, lowStockThreshold: 200, motorChannel: 7, pricing: { costPerGram: 0.5, sellingPricePerGram: 1.0 } },
      { machineId: 'vm_001', ingredientId: 'chia', name: 'Chia Seeds', type: 'ADDON', currentStockGrams: 300, lowStockThreshold: 500, motorChannel: 8, pricing: { costPerGram: 1.0, sellingPricePerGram: 2.0 } }, // Purposely set low to trigger the red UI alert!
    ];

    // 3. Inject into the database
    await Inventory.insertMany(initialStock);
    console.log('✅ Successfully seeded vending machine inventory!');
    
    // Disconnect and close the script
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding inventory:', error);
    process.exit(1);
  }
};

seedInventory();