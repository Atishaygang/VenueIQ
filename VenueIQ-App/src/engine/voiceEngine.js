// src/engine/voiceEngine.js
export const speechSupported = () => 'speechSynthesis' in window;

export const cancelSpeech = () => {
  if (speechSupported()) {
    window.speechSynthesis.cancel();
  }
};

export const isMuted = () => {
  return localStorage.getItem('venueiq_muted') === 'true';
};

// Core speaker — all voice goes through this
export const speak = (text, options = {}) => {
  if (!speechSupported() || isMuted()) return;

  const { rate = 1, pitch = 1, volume = 1, priority = 'normal' } = options;
  
  if (priority === 'high') {
    cancelSpeech();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;
  
  // Pick best available voice — prefer English India if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang.includes('en-IN')) ||
                    voices.find(v => v.lang.includes('en-US')) ||
                    voices[0];
                    
  if (preferred) {
    utterance.voice = preferred;
  }
  
  window.speechSynthesis.speak(utterance);
};
