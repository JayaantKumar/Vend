// frontend/src/components/AdsPlayer.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function AdsPlayer({ onWakeUp }) {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/admin/ads');
        setPlaylist(res.data);
      } catch (error) {
        console.error("Failed to load ads:", error);
      }
    };
    fetchAds();
  }, []);

  useEffect(() => {
    if (playlist.length === 0) return;

    const currentAd = playlist[currentIndex];
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % playlist.length);
    }, currentAd.duration);

    return () => clearTimeout(timer);
  }, [currentIndex, playlist]);

  // Helper function to check if a URL is a YouTube link
  const isYouTube = (url) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Helper function to convert a normal YouTube link into a muted, autoplaying background embed
  const getYouTubeEmbedUrl = (url) => {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    }
    // Adds parameters to autoplay, mute, hide controls, and loop
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1`;
  };

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
        isYouTube(currentAd.url) ? (
          /* Render YouTube Player */
          <iframe 
            src={getYouTubeEmbedUrl(currentAd.url)} 
            className="w-[150%] h-[150%] pointer-events-none" // 150% scales it up slightly to hide youtube black borders
            allow="autoplay; encrypted-media" 
            frameBorder="0"
          />
        ) : (
          /* Render Standard MP4 Video */
          <video ref={videoRef} src={currentAd.url} autoPlay muted loop className="w-full h-full object-cover" />
        )
      ) : (
        /* Render Image */
        <img 
          src={currentAd.url} 
          alt="Advertisement" 
          className="w-full h-full object-cover"
          onError={(e) => {
            // If the image fails to load, it will show a grey box instead of pure black so you know it's a broken link
            e.target.src = 'https://placehold.co/1080x1920/333333/ffffff?text=Image+Link+Broken\nPlease+use+direct+image+address';
          }}
        />
      )}
    </div>
  );
}