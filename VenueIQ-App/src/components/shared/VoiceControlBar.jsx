import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cancelSpeech } from '../../engine/voiceEngine';

export default function VoiceControlBar({ isMobile }) {
  const [muted, setMuted] = useState(() => {
    return localStorage.getItem('venueiq_muted') === 'true';
  });

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    localStorage.setItem('venueiq_muted', next.toString());
    if (next) {
      cancelSpeech();
    }
  };

  // Sync state across tabs if needed
  useEffect(() => {
    const handleStorage = () => {
      setMuted(localStorage.getItem('venueiq_muted') === 'true');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <button
      onClick={toggleMute}
      title="Toggle voice announcements"
      aria-label="Toggle voice announcements"
      aria-pressed={!muted}
      className={`fixed top-4 ${isMobile ? 'right-16' : 'right-4'} z-[100] bg-[#1a1a24] text-white p-2 rounded-full shadow-lg border border-gray-700 hover:bg-[#2a2a35] focus:ring-2 focus:ring-purple-500 transition-colors`}
    >
      {muted ? <VolumeX size={20} className="text-gray-400" /> : <Volume2 size={20} className="text-[#f59e0b]" />}
    </button>
  );
}
