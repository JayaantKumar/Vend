// src/App.jsx
import React, { useState } from 'react';
import ProductSelection from './components/ProductSelection';
import Cart from './components/Cart';
import Payment from './components/Payment';

function App() {
  const [currentScreen, setCurrentScreen] = useState('SELECT'); 
  const [cart, setCart] = useState([]);

  const getTotal = () => cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SELECT':
        return (
          <ProductSelection 
            cart={cart} 
            setCart={setCart} 
            goToCart={() => setCurrentScreen('CART')} // THIS IS CRITICAL
          />
        );
      case 'CART':
        return (
          <Cart 
            cart={cart} 
            setCart={setCart} 
            goBack={() => setCurrentScreen('SELECT')} 
            goToPay={() => setCurrentScreen('PAY')} 
          />
        );
      case 'PAY':
        return (
          <Payment 
            total={getTotal()} 
            goBack={() => setCurrentScreen('CART')} 
            onPaymentSuccess={() => setCurrentScreen('PROCESSING')} 
          />
        );
      case 'PROCESSING':
        return (
          <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white">
             <h1 className="text-4xl text-[#17cf17] font-bold animate-pulse">Crafting your shake...</h1>
             <button onClick={() => { setCart([]); setCurrentScreen('SELECT'); }} className="mt-12 text-gray-600 underline">Finish & Reset</button>
          </div>
        );
      default:
        return <ProductSelection cart={cart} setCart={setCart} goToCart={() => setCurrentScreen('CART')} />;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black font-lexend select-none">
      {renderScreen()}
    </div>
  );
}

export default App;