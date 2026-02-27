// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';

import ProductSelection from './components/ProductSelection';
import Cart from './components/Cart';
import Payment from './components/Payment';
import Admin from './components/Admin'; 
import AdsPlayer from './components/AdsPlayer';

const socket = io('http://localhost:5001'); 

const ProcessingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalTimeMs = 15000; 
    const intervalMs = 100; 
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

  useEffect(() => {
    if (progress >= 100) {
      const redirectTimer = setTimeout(() => onComplete(), 3000);
      return () => clearTimeout(redirectTimer);
    }
  }, [progress, onComplete]);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white relative font-lexend">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#17cf17] rounded-full blur-[150px] opacity-20"></div>
      <h1 className={`text-5xl font-extrabold z-10 drop-shadow-[0_0_15px_rgba(23,207,23,0.8)] mb-12 transition-colors ${progress === 100 ? 'text-white' : 'text-[#17cf17] animate-pulse'}`}>
        {progress < 100 ? 'Crafting your shake...' : 'Drink is Ready!'}
      </h1>
      <div className="relative flex items-center justify-center z-10 mb-10">
        <svg className="transform -rotate-90 w-72 h-72 drop-shadow-[0_0_20px_rgba(23,207,23,0.4)]">
          <circle cx="144" cy="144" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-800" />
          <circle 
            cx="144" cy="144" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-[#17cf17]"
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            strokeLinecap="round" 
          />
        </svg>
        <span className="absolute text-6xl font-extrabold text-white">{Math.floor(progress)}%</span>
      </div>
      <p className="text-2xl text-gray-300 z-10 font-medium">
        {progress < 100 ? 'Dispensing cup and mixing premium ingredients...' : 'Enjoy your HydraFuel!'}
      </p>
    </div>
  );
};

function KioskApp() {
  const [currentScreen, setCurrentScreen] = useState('SELECT'); 
  const [cart, setCart] = useState([]);
  const [isIdle, setIsIdle] = useState(false);

  // 🚀 UPGRADED IDLE DETECTOR: Pauses during payment
  useEffect(() => {
    let idleTimeout;

    const resetIdleTimer = () => {
      setIsIdle(false);
      clearTimeout(idleTimeout);
      
      // ONLY start the 15-second timer if they are on the Select or Cart screens!
      if (currentScreen === 'SELECT' || currentScreen === 'CART') {
        idleTimeout = setTimeout(() => {
          console.log("⏰ 15 seconds passed! Activating Ads Mode.");
          setIsIdle(true);
          setCart([]); // Clear any abandoned carts
          setCurrentScreen('SELECT'); 
        }, 15000); 
      }
    };

    window.addEventListener('mousedown', resetIdleTimer);
    window.addEventListener('touchstart', resetIdleTimer);
    window.addEventListener('click', resetIdleTimer);

    // Start timer immediately based on current screen
    resetIdleTimer();

    return () => {
      window.removeEventListener('mousedown', resetIdleTimer);
      window.removeEventListener('touchstart', resetIdleTimer);
      window.removeEventListener('click', resetIdleTimer);
      clearTimeout(idleTimeout);
    };
  }, [currentScreen]); // <-- Added currentScreen as a dependency so it knows when to pause!

  useEffect(() => {
    socket.emit('register_machine', 'vm_001');
    socket.on('payment_success', () => {
      setCurrentScreen('PROCESSING');
    });
    return () => socket.off('payment_success');
  }, []);

  const getTotal = () => cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

  const handleWakeUp = () => setIsIdle(false);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'SELECT':
        return <ProductSelection cart={cart} setCart={setCart} goToCart={() => setCurrentScreen('CART')} goToPay={() => setCurrentScreen('PAY')} />;
      case 'CART':
        return <Cart cart={cart} setCart={setCart} goBack={() => setCurrentScreen('SELECT')} goToPay={() => setCurrentScreen('PAY')} />;
      case 'PAY':
        return <Payment total={getTotal()} cart={cart} goBack={() => setCurrentScreen('CART')} onPaymentSuccess={() => setCurrentScreen('PROCESSING')} />;
      case 'PROCESSING':
        return <ProcessingScreen onComplete={() => { setCart([]); setCurrentScreen('SELECT'); }} />;
      default:
        return <ProductSelection cart={cart} setCart={setCart} goToCart={() => setCurrentScreen('CART')} goToPay={() => setCurrentScreen('PAY')} />;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black font-lexend select-none relative">
      {isIdle && <AdsPlayer onWakeUp={handleWakeUp} />}
      {!isIdle && renderScreen()}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<KioskApp />} />
        <Route path="/admin" element={<Admin goBack={() => window.location.href = '/'} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}