import React from 'react';

// Re-declare addons here or import them from a shared config file in a real app
const ADDONS_MAP = {
  'banana': 'Banana',
  'creatine': 'Creatine',
  'dryfruits': 'Dry Fruits',
  'oats': 'Oats',
};

export default function Cart({ cart, setCart, goBack, goToPay }) {
  // Use unitPrice since the base price now includes addons
  const total = cart.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);

  const updateQuantity = (cartItemId, delta) => {
    setCart(cart.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.qty + delta;
        return { ...item, qty: newQty > 0 ? newQty : 0 };
      }
      return item;
    }).filter(item => item.qty > 0)); 
  };

  const removeItem = (cartItemId) => {
    setCart(cart.filter(item => item.cartItemId !== cartItemId));
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col pt-8 px-12 pb-12 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
        <button onClick={goBack} className="text-gray-400 flex items-center gap-2 text-xl hover:text-white transition-colors cursor-pointer relative z-50">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Back to Menu
        </button>
        <h1 className="text-4xl font-bold border-b-4 border-cyan-blue pb-2">Your Cart</h1>
        <div className="w-24"></div> 
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto pr-4 hide-scrollbar space-y-4 relative z-10">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <svg className="w-24 h-24 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <h2 className="text-2xl">Your cart is empty</h2>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.cartItemId} className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white/10 rounded-xl flex items-center justify-center overflow-hidden">
                   <img src={item.image} alt={item.name} className="object-cover w-full h-full mix-blend-multiply opacity-80" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{item.name}</h3>
                  {/* DISPLAY ADDONS HERE */}
                  <div className="text-sm text-tangerine-orange font-medium mt-1 mb-1">
                    {Object.entries(item.addons).map(([id, qty]) => qty > 0 && (
                      <span key={id} className="mr-3 bg-gray-800 px-2 py-1 rounded">+{qty} {ADDONS_MAP[id] || id}</span>
                    ))}
                  </div>
                  <p className="text-cyan-blue font-semibold text-lg">₹{item.unitPrice} per cup</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                {/* Quantity Controls */}
                <div className="flex items-center bg-gray-800 rounded-full p-2">
                  <button onClick={() => updateQuantity(item.cartItemId, -1)} className="w-12 h-12 rounded-full bg-gray-700 flex justify-center items-center text-2xl font-bold text-white active:bg-gray-600 cursor-pointer">-</button>
                  <span className="w-16 text-center font-bold text-2xl">{item.qty}</span>
                  <button onClick={() => updateQuantity(item.cartItemId, 1)} className="w-12 h-12 rounded-full bg-gray-700 flex justify-center items-center text-2xl font-bold text-white active:bg-gray-600 cursor-pointer">+</button>
                </div>
                
                <div className="text-right w-32">
                  <span className="text-3xl font-bold text-white">₹{item.unitPrice * item.qty}</span>
                </div>

                <button onClick={() => removeItem(item.cartItemId)} className="text-tangerine-orange hover:text-red-500 p-2 cursor-pointer relative z-50">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Checkout Footer */}
      <div className="bg-gray-900 border-t border-gray-800 pt-6 mt-4 flex justify-between items-center relative z-10">
        <div>
          <p className="text-gray-400 text-lg mb-1">Total Amount</p>
          <p className="text-5xl font-extrabold text-primary">₹{total}</p>
        </div>
        
        <button 
          onClick={goToPay}
          disabled={cart.length === 0}
          className="bg-primary text-black px-16 py-6 rounded-2xl text-2xl font-extrabold shadow-[0_0_20px_rgba(23,207,23,0.4)] disabled:opacity-50 disabled:shadow-none transition-transform hover:scale-[1.02] active:scale-95 flex items-center gap-4 cursor-pointer relative z-50"
        >
          Proceed to Pay
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>
  );
}