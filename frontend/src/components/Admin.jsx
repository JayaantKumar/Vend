// frontend/src/components/Admin.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Admin({ goBack }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'inventory', 'ads'
  const [data, setData] = useState({ orders: [], inventory: [], ads: [] });
  
  // Ad Form State
  const [newAd, setNewAd] = useState({ type: 'image', url: '', duration: 5000 });

  const fetchData = async () => {
    try {
      const [ordersRes, invRes, adsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/admin/orders'),
        axios.get('http://localhost:5001/api/admin/inventory'),
        axios.get('http://localhost:5001/api/admin/ads')
      ]);
      setData({ orders: ordersRes.data, inventory: invRes.data, ads: adsRes.data });
    } catch (error) {
      console.error("Failed to load admin data:", error);
    }
  };

  useEffect(() => {
    // Wrap initial call to be async-aware
    const initData = async () => {
      await fetchData();
    };
    initData();

    // Auto-refresh every 5s
    const interval = setInterval(() => {
      fetchData();
    }, 5000); 
    
    return () => clearInterval(interval);
  }, []);

  const handleAddAd = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/admin/ads', newAd);
      setNewAd({ type: 'image', url: '', duration: 5000 });
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Failed to add ad:", error);
    }
  };

  const handleDeleteAd = async (id) => {
    try {
      await axios.delete(`http://localhost:5001/api/admin/ads/${id}`);
      fetchData();
    } catch (error) {
      console.error("Failed to delete ad:", error);
    }
  };

  return (
    <div className="w-full h-full bg-gray-950 text-white flex flex-col p-10 font-lexend">
      
      {/* Header & Tabs */}
      <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-bold text-[#FF8C00] mb-4">Cloud Console</h1>
          <div className="flex gap-4">
            {['orders', 'inventory', 'ads'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg font-bold capitalize transition-all ${activeTab === tab ? 'bg-[#17cf17] text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <button onClick={goBack} className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl font-bold transition-colors">
          Exit to Kiosk
        </button>
      </div>

      {/* 🧾 ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="flex-1 overflow-y-auto bg-gray-900 rounded-xl border border-gray-800 p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 border-b border-gray-800">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.orders.map(o => (
                <tr key={o._id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-4 text-[#00CED1] font-mono text-sm">{o.orderId}</td>
                  <td className={`py-4 font-bold text-sm ${o.status === 'PAID' ? 'text-[#17cf17]' : 'text-yellow-500'}`}>{o.status}</td>
                  <td className="py-4 text-sm">{o.items.map(i => i.name).join(', ')}</td>
                  <td className="py-4 font-bold text-[#FF8C00]">₹{o.ledger?.totalAmount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 📦 INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-2 gap-6 overflow-y-auto">
          {data.inventory.length === 0 ? (
            <p className="text-gray-500 italic">No inventory tracked yet.</p>
          ) : data.inventory.map(item => (
            <div key={item._id} className="bg-gray-900 p-6 rounded-xl border border-gray-800">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-xl">{item.name}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.currentStockGrams < item.lowStockThreshold ? 'bg-red-500/20 text-red-500' : 'bg-[#17cf17]/20 text-[#17cf17]'}`}>
                  {item.currentStockGrams}g left
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full ${item.currentStockGrams < item.lowStockThreshold ? 'bg-red-500' : 'bg-[#17cf17]'}`} 
                  style={{ width: `${Math.min((item.currentStockGrams / 5000) * 100, 100)}%` }} // Assumes 5000g is max capacity
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📺 ADS MANAGER TAB */}
      {activeTab === 'ads' && (
        <div className="flex gap-8 overflow-hidden h-full">
          {/* Add New Ad Form */}
          <div className="w-1/3 bg-gray-900 p-6 rounded-xl border border-gray-800 h-fit">
            <h2 className="text-xl font-bold mb-4">Upload New Ad</h2>
            <form onSubmit={handleAddAd} className="flex flex-col gap-4">
              <select value={newAd.type} onChange={e => setNewAd({...newAd, type: e.target.value})} className="bg-gray-800 p-3 rounded-lg text-white">
                <option value="image">Image URL</option>
                <option value="video">Video URL (MP4)</option>
              </select>
              <input type="text" placeholder="https://... image/video link" value={newAd.url} onChange={e => setNewAd({...newAd, url: e.target.value})} required className="bg-gray-800 p-3 rounded-lg text-white outline-none" />
              <input type="number" placeholder="Duration in MS (e.g. 5000 = 5s)" value={newAd.duration} onChange={e => setNewAd({...newAd, duration: Number(e.target.value)})} required className="bg-gray-800 p-3 rounded-lg text-white outline-none" />
              <button type="submit" className="bg-[#17cf17] text-black font-bold py-3 rounded-lg hover:bg-green-400">Add to Playlist</button>
            </form>
          </div>

          {/* Active Ads List */}
          <div className="w-2/3 overflow-y-auto bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-xl font-bold mb-4">Live Playlist</h2>
            <div className="grid grid-cols-2 gap-4">
              {data.ads.length === 0 ? <p className="text-gray-500">No ads running. Displaying default HydraFuel screensaver.</p> : null}
              {data.ads.map(ad => (
                <div key={ad._id} className="relative bg-black rounded-lg overflow-hidden border border-gray-700 aspect-video group">
                  {ad.type === 'video' ? (
                    <video src={ad.url} className="w-full h-full object-cover opacity-50" />
                  ) : (
                    <img src={ad.url} className="w-full h-full object-cover opacity-50" />
                  )}
                  <div className="absolute inset-0 flex flex-col justify-between p-3">
                    <span className="bg-black/80 w-fit px-2 py-1 rounded text-xs font-bold uppercase">{ad.type} • {ad.duration / 1000}s</span>
                    <button onClick={() => handleDeleteAd(ad._id)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Remove Ad
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}