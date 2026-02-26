// frontend/src/components/AdsPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function AdsPlayer({ onWakeUp }) {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);

  // Fetch ads from database when player mounts
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/admin/ads');
        setPlaylist(res.data);
      } catch (error) {
        // FIX: Actually using the 'error' variable so ESLint stops complaining
        console.error("Failed to load ads:", error);
      }
    };
    fetchAds();
  }, []);

  // Timer logic for cycling ads
  useEffect(() => {
    if (playlist.length === 0) return;

    const currentAd = playlist[currentIndex];
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    }, currentAd.duration);

    return () => clearTimeout(timer);
  }, [currentIndex, playlist]);

  // If no ads are uploaded yet, show a default screensaver
  if (playlist.length === 0) {
    return (
      <div onClick={onWakeUp} className="fixed inset-0 z-[99999] bg-black cursor-pointer flex flex-col items-center justify-center">
        <h1 className="text-6xl font-extrabold text-[#17cf17] animate-pulse mb-8">VEND HYDRAFUEL</h1>
        <div className="bg-white/10 px-8 py-4 rounded-full border border-white/20 animate-bounce">
          <p className="text-white text-2xl font-bold tracking-widest">TOUCH TO START</p>
        </div>
      </div>
    );
  }

  const currentAd = playlist[currentIndex];

  return (
    <div onClick={onWakeUp} className="fixed inset-0 z-[99999] bg-black cursor-pointer flex items-center justify-center overflow-hidden">
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-8 py-4 rounded-full border border-white/20 z-50 animate-bounce shadow-2xl">
        <p className="text-white text-2xl font-bold tracking-widest drop-shadow-lg">TOUCH TO START ORDERING</p>
      </div>

      {currentAd.type === 'video' ? (
        <video ref={videoRef} src={currentAd.url} autoPlay muted loop className="w-full h-full object-cover" />
      ) : (
        <img src={currentAd.url} alt="Advertisement" className="w-full h-full object-cover" />
      )}
    </div>
  );
}