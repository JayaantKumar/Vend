// frontend/src/components/Admin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Admin({ goBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Hitting the new admin route we just built!
        const response = await axios.get('http://localhost:5001/api/admin/orders');
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to load orders", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
    // Auto-refresh the dashboard every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-gray-950 text-white flex flex-col p-12 relative overflow-hidden font-lexend">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-[#FF8C00]">System Console</h1>
          <p className="text-gray-400 mt-2">Live Order & Hardware Diagnostics</p>
        </div>
        <button onClick={goBack} className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl font-bold transition-colors">
          Exit Admin Mode
        </button>
      </div>

      {/* Orders Table */}
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        <div className="grid grid-cols-5 bg-black/50 p-6 border-b border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-sm">
          <div>Order ID</div>
          <div>Status</div>
          <div>Items</div>
          <div>Amount</div>
          <div>Time</div>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar p-2">
          {loading ? (
             <div className="flex justify-center items-center h-full text-[#00CED1] animate-pulse">Syncing Database...</div>
          ) : orders.length === 0 ? (
             <div className="flex justify-center items-center h-full text-gray-600">No orders logged yet.</div>
          ) : (
            orders.map(order => (
              <div key={order._id} className="grid grid-cols-5 items-center p-4 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <div className="font-mono text-sm text-[#00CED1]">{order.orderId}</div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'PAID' ? 'bg-[#17cf17]/20 text-[#17cf17] border border-[#17cf17]/30' : 
                    order.status === 'PENDING_PAYMENT' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-sm truncate pr-4">
                  {order.items.map(item => item.name).join(', ')}
                </div>
                <div className="font-bold text-[#FF8C00]">₹{order.ledger?.totalAmount || 0}</div>
                <div className="text-gray-500 text-sm">
                  {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}