import React, { useState, useEffect } from 'react';

export default function Payment({ total, goBack, onPaymentSuccess }) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      goBack(); // Auto-cancel order if timer runs out
      return;
    }
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, goBack]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="w-full h-full bg-black text-white flex flex-col items-center justify-center p-12 relative">
      
      <button onClick={goBack} className="absolute top-12 left-12 text-gray-400 flex items-center gap-2 text-xl hover:text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        Cancel Order
      </button>

      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold mb-4">Complete Your Payment</h1>
        <p className="text-2xl text-gray-400">Scan via PhonePe, GPay, or Paytm</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-[0_0_40px_rgba(0,206,209,0.3)] mb-10 relative">
        {/* Mock QR Code - In production, this is the Cashfree dynamic QR image */}
        <div className="w-80 h-80 bg-gray-200 border-4 border-dashed border-gray-400 flex items-center justify-center">
          <span className="text-black font-bold text-xl">Dynamic UPI QR Here</span>
        </div>
        
        {/* Scanning Animation Overlay */}
        <div className="absolute top-8 left-8 right-8 h-1 bg-primary shadow-[0_0_10px_#17cf17] animate-[ping_2s_infinite]"></div>
      </div>

      <div className="flex flex-col items-center">
        <div className="text-tangerine-orange text-5xl font-extrabold mb-4">₹{total}</div>
        <div className="bg-gray-900 px-6 py-3 rounded-full border border-gray-800 flex items-center gap-3">
          <svg className="w-6 h-6 text-cyan-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span className="text-xl font-mono text-cyan-blue">
            {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
          </span>
        </div>
      </div>

      {/* DEV ONLY BUTTON: To simulate webhook response from backend */}
      <button 
        onClick={onPaymentSuccess}
        className="absolute bottom-12 right-12 bg-gray-800 text-gray-400 px-4 py-2 rounded text-sm hover:bg-primary hover:text-black transition-colors"
      >
        [Dev] Simulate Success
      </button>

    </div>
  );
}