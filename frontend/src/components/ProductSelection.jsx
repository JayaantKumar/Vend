// frontend/src/components/ProductSelection.jsx
import React, { useState } from 'react';

import Vanilla from '../assets/Vanilla.png';
import Chocolate from '../assets/Chocolate.png';

// ADDON IMAGES (PLACEHOLDERS FOR NOW - REPLACE WITH REAL ONES)
import Banana from '../assets/Banana.png';
import Creatine from '../assets/Creatine.png';

// 🥤 10 Protein Base Options
const PRODUCTS = [
  { id: 'vanilla', name: 'Vanilla Bean', price: 80, image: Vanilla },
  { id: 'chocolate', name: 'Chocolate Fudge', price: 80, image: Chocolate },
  { id: 'strawberry', name: 'Strawberry', price: 80, image: 'https://placehold.co/300x400/ffffff/000000?text=Strawberry\nDelight' },
  { id: 'peanut', name: 'Peanut Protein', price: 90, image: 'https://placehold.co/300x400/ffffff/000000?text=Peanut\nPower' },
  { id: 'cookies', name: 'Cookies & Cream', price: 95, image: 'https://placehold.co/300x400/ffffff/000000?text=Cookies\nCream' },
  { id: 'mocha', name: 'Coffee Mocha', price: 90, image: 'https://placehold.co/300x400/ffffff/000000?text=Coffee\nMocha' },
  { id: 'banana_caramel', name: 'Banana Caramel', price: 85, image: 'https://placehold.co/300x400/ffffff/000000?text=Banana\nCaramel' },
  { id: 'mint_choc', name: 'Mint Chocolate', price: 85, image: 'https://placehold.co/300x400/ffffff/000000?text=Mint\nChoco' },
  { id: 'salted_caramel', name: 'Salted Caramel', price: 90, image: 'https://placehold.co/300x400/ffffff/000000?text=Salted\nCaramel' },
  { id: 'pure_isolate', name: 'Pure Isolate (0g Sugar)', price: 110, image: 'https://placehold.co/300x400/ffffff/000000?text=Pure\nIsolate' },
];

// 🍌 8 Visual Booster Add-ons
const ADDONS = [
  { id: 'banana', name: 'Fresh Banana', price: 10, image:  Banana},
  { id: 'creatine', name: 'Creatine (5g)', price: 15, image:  Creatine},
  { id: 'dryfruits', name: 'Dry Fruits', price: 20, image: 'https://placehold.co/150x150/1f2937/FF8C00?text=🥜' },
  { id: 'oats', name: 'Rolled Oats', price: 10, image: 'https://placehold.co/150x150/1f2937/ffffff?text=🌾' },
  { id: 'pb', name: 'Peanut Butter', price: 15, image: 'https://placehold.co/150x150/1f2937/FF8C00?text=🍯' },
  { id: 'honey', name: 'Organic Honey', price: 10, image: 'https://placehold.co/150x150/1f2937/FFD700?text=🐝' },
  { id: 'chia', name: 'Chia Seeds', price: 15, image: 'https://placehold.co/150x150/1f2937/17cf17?text=🌱' },
  { id: 'espresso', name: 'Espresso Shot', price: 20, image: 'https://placehold.co/150x150/1f2937/ffffff?text=☕' },
];

export default function ProductSelection({ goToCart, cart, setCart, goToPay}) {
  const [activeModalProduct, setActiveModalProduct] = useState(null);
  const [modalAddons, setModalAddons] = useState({});
  const [modalQty, setModalQty] = useState(1);

  const openModal = (product) => {
    setActiveModalProduct(product);
    setModalAddons({}); 
    setModalQty(1);
  };

  const closeModal = () => setActiveModalProduct(null);

  const updateModalAddon = (id, delta) => {
    setModalAddons(prev => {
      const current = prev[id] || 0;
      const next = current + delta;
      return { ...prev, [id]: next > 0 ? next : 0 };
    });
  };

  const calculateModalTotal = () => {
    if (!activeModalProduct) return 0;
    let price = activeModalProduct.price;
    Object.entries(modalAddons).forEach(([id, qty]) => {
      const addon = ADDONS.find(a => a.id === id);
      if (addon) price += addon.price * qty;
    });
    return price * modalQty;
  };

  const confirmAddToCart = () => {
    const finalItem = {
      ...activeModalProduct,
      cartItemId: Math.random().toString(36).substr(2, 9),
      qty: modalQty,
      addons: modalAddons,
      unitPrice: calculateModalTotal() / modalQty,
    };
    setCart([...cart, finalItem]);
    closeModal();
  };

  // Calculate total for the quick-pay floating bar
  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

  return (
    <div className="w-full h-full bg-gradient-to-r from-orange-400 via-yellow-500 to-[#17cf17] text-white flex flex-col pt-8 px-12 relative overflow-hidden">
      
      {/* 🚀 FIXED CART BUTTON */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          goToCart();
        }} 
        className="fixed top-8 right-12 w-16 h-16 bg-black/60 hover:bg-black/90 rounded-full flex items-center justify-center cursor-pointer shadow-2xl z-[9999] border-2 border-white/30 transition-transform active:scale-90"
      >
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-black">
            {cart.reduce((acc, item) => acc + item.qty, 0)}
          </span>
        )}
      </button>

      {/* HEADER */}
      <div className="flex justify-between items-center w-full mb-8 relative z-50">
        <div 
         className="w-16 h-16 bg-white/30 rounded-xl backdrop-blur-md flex items-center justify-center font-bold text-xl shadow-lg">
          VH
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-4 bg-black/20 p-2 rounded-full backdrop-blur-md shadow-lg">
          <div className="px-6 py-2 bg-white text-black font-bold rounded-full shadow-md">1 Select</div>
          <div className="px-6 py-2 text-white/90 font-semibold">2 Cart</div>
          <div className="px-6 py-2 text-white/90 font-semibold">3 Pay</div>
        </div>
      </div>

      <div className="text-center mb-10 relative z-10">
        <h1 className="text-5xl font-extrabold mb-3 text-white drop-shadow-lg">Ethereal Flavor Journey</h1>
        <p className="text-xl font-medium text-white/90 drop-shadow">Choose up to <span className="text-black font-bold bg-white/40 px-3 py-1 rounded shadow-sm">3 scoops</span>. Add multiple drinks to cart.</p>
      </div>

      {/* PRODUCT GRID - Changed to grid-cols-5 to fit 10 items beautifully */}
      <div className="flex-1 overflow-y-auto pb-10 hide-scrollbar relative z-10">
        <div className="grid grid-cols-5 gap-6 px-4">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="bg-white/10 border border-white/30 backdrop-blur-md rounded-3xl p-4 flex flex-col h-[360px] shadow-2xl transition-transform hover:scale-[1.02]">
              <div className="flex-1 w-full bg-white/20 rounded-2xl mb-4 overflow-hidden shadow-inner flex items-center justify-center">
                 <img src={product.image} alt={product.name} className="object-cover w-full h-full mix-blend-multiply opacity-80" />
              </div>
              <div className="mt-auto">
                <h3 className="text-xl font-bold mb-1 drop-shadow-sm leading-tight">{product.name}</h3>
                <div className="flex justify-between items-end mb-3">
                  <span className="text-white font-bold text-xl">₹{product.price}</span>
                </div>
                <button 
                  onClick={() => openModal(product)}
                  className="w-full bg-[#17cf17] text-black font-extrabold py-3 rounded-xl text-lg hover:bg-green-400 active:scale-95 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.2)]"
                >
                  Customize
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🛠️ UPGRADED MODAL WITH BOOSTER GRID */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-8">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-5xl flex overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.7)] h-[80vh]">
            
            {/* Left Column: Base Product */}
            <div className="w-1/3 bg-gray-800 p-8 flex flex-col items-center justify-center text-center border-r border-gray-700">
              <img src={activeModalProduct.image} alt={activeModalProduct.name} className="w-56 h-56 object-cover rounded-2xl mb-8 shadow-2xl" />
              <h2 className="text-3xl font-bold text-white mb-2">{activeModalProduct.name}</h2>
              <p className="text-[#00CED1] font-semibold text-2xl">Base: ₹{activeModalProduct.price}</p>
            </div>
            
            {/* Right Column: Boosters Grid */}
            <div className="w-2/3 flex flex-col bg-gray-900 text-white">
              <div className="flex justify-between items-center p-8 pb-4 border-b border-gray-800">
                <h3 className="text-3xl font-bold text-[#FF8C00]">Supercharge Your Drink</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-white bg-gray-800 hover:bg-red-500 rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold transition-colors">&times;</button>
              </div>
              
              {/* Scrollable Booster Grid */}
              <div className="flex-1 overflow-y-auto p-8 hide-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  {ADDONS.map(addon => (
                    <div key={addon.id} className="flex items-center bg-gray-800/60 p-3 rounded-2xl border border-gray-700 hover:border-gray-500 transition-colors">
                      {/* Addon Image */}
                      <img src={addon.image} alt={addon.name} className="w-16 h-16 rounded-xl mr-4 object-cover border border-gray-600 shadow-md" />
                      
                      <div className="flex-1">
                        <p className="font-bold text-lg leading-tight">{addon.name}</p>
                        <p className="text-[#17cf17] font-semibold text-sm">+₹{addon.price}</p>
                      </div>
                      
                      {/* Controls */}
                      <div className="flex items-center gap-2 bg-black/40 rounded-full p-1 border border-gray-700 ml-2">
                        <button onClick={() => updateModalAddon(addon.id, -1)} className="w-8 h-8 rounded-full bg-gray-700 text-lg font-bold hover:bg-gray-600 flex items-center justify-center">-</button>
                        <span className="w-5 text-center font-bold text-md">{modalAddons[addon.id] || 0}</span>
                        <button onClick={() => updateModalAddon(addon.id, 1)} className="w-8 h-8 rounded-full bg-gray-700 text-lg font-bold hover:bg-gray-600 flex items-center justify-center">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Footer Checkout */}
              <div className="p-8 pt-6 border-t border-gray-800 bg-gray-900 flex justify-between items-end">
                <div>
                  <p className="text-gray-400 font-semibold mb-1 text-lg">Total for this cup</p>
                  <p className="text-5xl font-extrabold text-white">₹{calculateModalTotal()}</p>
                </div>
                <div className="flex items-center gap-6">
                  {/* Item Quantity Multiplier */}
                  <div className="flex items-center gap-4 bg-gray-800 rounded-2xl p-2 border border-gray-700">
                    <span className="text-gray-400 font-medium pl-3">Qty:</span>
                    <button onClick={() => setModalQty(Math.max(1, modalQty - 1))} className="w-10 h-10 rounded-xl bg-gray-700 text-xl font-bold hover:bg-gray-600">-</button>
                    <span className="w-6 text-center font-bold text-xl">{modalQty}</span>
                    <button onClick={() => setModalQty(modalQty + 1)} className="w-10 h-10 rounded-xl bg-gray-700 text-xl font-bold hover:bg-gray-600">+</button>
                  </div>

                  <button onClick={confirmAddToCart} className="bg-[#17cf17] text-black px-10 py-5 rounded-2xl font-bold text-2xl hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(23,207,23,0.3)]">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🚀 EXPRESS CHECKOUT FLOATING BAR */}
      {cart.length > 0 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-11/12 max-w-3xl bg-black/80 backdrop-blur-xl border border-[#17cf17]/50 p-6 rounded-3xl flex justify-between items-center shadow-[0_10px_40px_rgba(23,207,23,0.3)] animate-[slideInUp_0.5s_ease-out] z-[9998]">
          
          {/* Order Info */}
          <div className="flex flex-col">
            <span className="text-gray-400 font-bold tracking-widest text-sm uppercase mb-1">
              {cart.length} Item{cart.length > 1 ? 's' : ''} Selected
            </span>
            <span className="text-white text-4xl font-extrabold">
              Total: <span className="text-[#FF8C00]">₹{cartTotal}</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 items-center">
            {/* Keeping the Cart system alive just in case they want to edit */}
            <button 
              onClick={goToCart} 
              className="bg-gray-800 text-white px-6 py-4 rounded-2xl font-bold text-xl hover:bg-gray-700 transition-colors border border-gray-700"
            >
              View Cart
            </button>
            
            {/* The giant, glowing Instant Pay button */}
            <button 
              onClick={goToPay} 
              className="bg-[#17cf17] text-black px-10 py-4 rounded-2xl font-extrabold text-2xl shadow-[0_0_20px_rgba(23,207,23,0.5)] animate-pulse hover:scale-105 transition-transform flex items-center gap-3"
            >
              Pay to Get Drink
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
}