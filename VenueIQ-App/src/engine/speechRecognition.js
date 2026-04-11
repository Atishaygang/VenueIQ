// src/engine/speechRecognition.js
export const speechSupported = () => !!(window.SpeechRecognition || window.webkitSpeechRecognition);

export const startListening = (onResult, onError) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) { 
    onError('Not supported'); 
    return null;
  }
  
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  
  recognition.onresult = (e) => {
    if (e.results.length > 0) {
      onResult(e.results[0][0].transcript);
    }
  };
  
  recognition.onerror = (e) => {
    onError(e.error);
  };
  
  recognition.start();
  return recognition;
};
