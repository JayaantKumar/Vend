// frontend/src/components/Payment.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { load } from '@cashfreepayments/cashfree-js';

export default function Payment({ total, goBack, onPaymentSuccess, cart }) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Track the Order ID specifically for our polling radar
  const [orderId, setOrderId] = useState(null); 
  
  // We need a reference to the Cashfree instance
  const cashfreeRef = useRef(null);

  // 1. Initialize Cashfree SDK on mount
  useEffect(() => {
    const initCashfree = async () => {
      // Use "sandbox" for test mode, change to "production" when live
      cashfreeRef.current = await load({ mode: "sandbox" });
    };
    initCashfree();
  }, []);

  // 2. Generate Order and render Cashfree UI
  useEffect(() => {
    const createOrderAndRenderQR = async () => {
      try {
        setLoading(true);
        const response = await axios.post('http://localhost:5001/api/payments/create', {
          amount: total,
          customerPhone: "9999999999", 
          items: cart 
        });

        if (response.data.success && cashfreeRef.current) {
          const sessionId = response.data.paymentSessionId;
          
          // Save the Order ID so the polling radar knows what to look for
          setOrderId(response.data.orderId);
          
          // Render the Cashfree Drop-in UI inside our specific div
          let checkoutOptions = {
            paymentSessionId: sessionId,
            redirectTarget: "_modal", // Opens their clean inline modal/UI
          };
          
          cashfreeRef.current.checkout(checkoutOptions);
          setLoading(false);
        } else {
          setError("Failed to initialize payment gateway.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Payment API Error:", err);
        setError("Network error. Please try again.");
        setLoading(false);
      }
    };

    if (cashfreeRef.current) {
      createOrderAndRenderQR();
    } else {
      // Small delay to ensure SDK loaded
      setTimeout(createOrderAndRenderQR, 500);
    }
  }, [total, cart]);

  // 3. 🚀 THE POLLING RADAR (Checks every 3 seconds)
  useEffect(() => {
    let pollingInterval;

    if (orderId) {
      pollingInterval = setInterval(async () => {
        try {
          console.log(`📡 Polling status for ${orderId}...`);
          const response = await axios.get(`http://localhost:5001/api/payments/status/${orderId}`);
          
          if (response.data.status === 'PAID') {
            console.log('🎉 Payment Confirmed via Polling! Stopping radar.');
            clearInterval(pollingInterval); // Stop asking the server
            onPaymentSuccess(); // Move the screen to "Processing"
          }
        } catch (err) {
          console.error("Polling check failed:", err);
        }
      }, 3000); // 3000ms = 3 seconds
    }

    // Cleanup: Stop polling if they cancel the order or leave the screen
    return () => clearInterval(pollingInterval);
  }, [orderId, onPaymentSuccess]);

  // 4. Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) {
      goBack(); 
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, goBack]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="w-full h-full bg-black text-white flex flex-col items-center justify-center p-12 relative font-lexend">
      
      <button onClick={goBack} className="absolute top-12 left-12 text-gray-400 flex items-center gap-2 text-xl hover:text-white transition-colors z-50 cursor-pointer">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        Cancel Order
      </button>

      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-4">Complete Your Payment</h1>
        <p className="text-2xl text-gray-400">Scan via PhonePe, GPay, or Paytm</p>
      </div>

      {/* The QR Code Container */}
      <div className="bg-white p-8 rounded-3xl shadow-[0_0_40px_rgba(0,206,209,0.3)] mb-10 relative flex flex-col items-center justify-center min-w-[350px] min-h-[350px]">
        {loading ? (
          <div className="flex flex-col items-center text-black">
            <div className="w-16 h-16 border-8 border-gray-200 border-t-[#00CED1] rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-xl text-gray-600">Generating Secure QR...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center text-center text-black">
            <p className="font-bold text-xl text-red-600">{error}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-black font-bold text-xl mb-4 border-b-2 border-gray-300 pb-2">VEND HYDRAFUEL</p>
            <p className="text-gray-600 text-sm">Please complete the payment using the Cashfree prompt.</p>
          </div>
        )}
        <div className="absolute top-8 left-8 right-8 h-1 bg-[#17cf17] shadow-[0_0_15px_#17cf17] animate-[ping_2.5s_infinite]"></div>
      </div>

      <div className="flex flex-col items-center">
        <div className="text-[#FF8C00] text-6xl font-extrabold mb-4 drop-shadow-md">₹{total}</div>
        <div className="bg-gray-900 px-8 py-4 rounded-full border border-gray-800 flex items-center gap-3 shadow-lg">
          <svg className="w-6 h-6 text-[#00CED1]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="text-2xl font-mono text-[#00CED1] font-bold tracking-widest">
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </span>
        </div>
      </div>

      {/* Keep the Dev button just in case you need to bypass payment during testing */}
      <button onClick={onPaymentSuccess} className="absolute bottom-12 right-12 bg-gray-800 text-gray-400 px-6 py-3 rounded-xl text-sm hover:bg-[#17cf17] hover:text-black transition-colors font-bold border border-gray-700">
        [Dev] Simulate Payment Success
      </button>

    </div>
  );
}