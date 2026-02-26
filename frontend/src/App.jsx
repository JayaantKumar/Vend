// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ProductSelection from './components/ProductSelection';
import Cart from './components/Cart';
import Payment from './components/Payment';
import Admin from './components/Admin'; 

// Connect to the backend
const socket = io('http://localhost:5001'); 

// 🔄 NEW: Dedicated Processing Component for the smooth animated circle
const ProcessingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  // 1. Simulate the drink mixing progress (0 to 100)
  useEffect(() => {
    const totalTimeMs = 15000; // 15 seconds to make a drink (adjust as needed)
    const intervalMs = 100; // Update every 100ms for smoothness
    const increment = 100 / (totalTimeMs / intervalMs);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, []);

  // 2. Automatically redirect when progress hits 100%
  useEffect(() => {
    if (progress >= 100) {
      // Wait 3 seconds on the "Ready!" screen before going back to the home page
      const redirectTimer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(redirectTimer);
    }
  }, [progress, onComplete]);

  // SVG Circle Math for the animated progress ring
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white relative font-lexend">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#17cf17] rounded-full blur-[150px] opacity-20"></div>

      <h1 className={`text-5xl font-extrabold z-10 drop-shadow-[0_0_15px_rgba(23,207,23,0.8)] mb-12 transition-colors ${progress === 100 ? 'text-white' : 'text-[#17cf17] animate-pulse'}`}>
        {progress < 100 ? 'Crafting your shake...' : 'Drink is Ready!'}
      </h1>

      {/* 🟢 Circular Progress Bar */}
      <div className="relative flex items-center justify-center z-10 mb-10">
        <svg className="transform -rotate-90 w-72 h-72 drop-shadow-[0_0_20px_rgba(23,207,23,0.4)]">
          {/* Background Track */}
          <circle cx="144" cy="144" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-800" />
          {/* Animated Green Progress Ring */}
          <circle 
            cx="144" cy="144" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-[#17cf17]"
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            strokeLinecap="round" 
          />
        </svg>
        {/* Percentage Text in Center */}
        <span className="absolute text-6xl font-extrabold text-white">
          {Math.floor(progress)}%
        </span>
      </div>

      <p className="text-2xl text-gray-300 z-10 font-medium">
        {progress < 100 ? 'Dispensing cup and mixing premium ingredients...' : 'Enjoy your HydraFuel!'}
      </p>
    </div>
  );
};

function App() {
  const [currentScreen, setCurrentScreen] = useState('SELECT'); 
  const [cart, setCart] = useState([]);

  useEffect(() => {
    socket.emit('register_machine', 'vm_001');

    socket.on('payment_success', (data) => {
      console.log('🎉 Payment Confirmed via Webhook for Order:', data.orderId);
      setCurrentScreen('PROCESSING');
    });

    return () => {
      socket.off('payment_success');
    };
  }, []);

  const getTotal = () => cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'ADMIN':
        return <Admin goBack={() => setCurrentScreen('SELECT')} />; 
        
      case 'SELECT':
        return (
          <ProductSelection 
            cart={cart} 
            setCart={setCart} 
            goToCart={() => setCurrentScreen('CART')} 
            openAdmin={() => setCurrentScreen('ADMIN')} 
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
            cart={cart}
            goBack={() => setCurrentScreen('CART')} 
            onPaymentSuccess={() => setCurrentScreen('PROCESSING')} 
          />
        );
        
      case 'PROCESSING':
        return (
          <ProcessingScreen 
            onComplete={() => {
              setCart([]); // Clear the cart for the next customer
              setCurrentScreen('SELECT'); // Auto-redirect to homepage
            }} 
          />
        );
        
      default:
        return (
          <ProductSelection 
            cart={cart} 
            setCart={setCart} 
            goToCart={() => setCurrentScreen('CART')} 
            openAdmin={() => setCurrentScreen('ADMIN')}
          />
        );
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black font-lexend select-none">
      {renderScreen()}
    </div>
  );
}

export default App;