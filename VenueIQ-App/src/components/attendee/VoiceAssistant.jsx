import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Send } from 'lucide-react';
import { startListening, speechSupported } from '../../engine/speechRecognition';
import { getAssistantResponse } from '../../engine/assistantEngine';
import { speak, isMuted } from '../../engine/voiceEngine';
import { useVenue } from '../../engine/VenueContext';

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState([
    { type: 'ai', text: "Hi! Ask me about your seat, exact crowd levels, or food wait times." }
  ]);
  const [textInput, setTextInput] = useState('');
  const venueState = useVenue();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [history, isOpen]);

  const handleAIResponse = (query) => {
    const reply = getAssistantResponse(query, venueState);
    setHistory(prev => [...prev, { type: 'ai', text: reply }]);
    
    if (!isMuted()) {
       speak(reply, { rate: 0.95, pitch: 1.1, priority: 'normal' });
    }
  };

  const handleMicClick = () => {
    if (!speechSupported()) {
       alert("Speech recognition not supported on this browser. Please use the text input.");
       return;
    }
    
    if (isListening) return; // Wait to finish or we could cancel
    setIsListening(true);
    
    startListening(
      (transcript) => {
        setIsListening(false);
        setHistory(prev => [...prev, { type: 'user', text: transcript }]);
        handleAIResponse(transcript);
      },
      (error) => {
        setIsListening(false);
        console.error("Mic error:", error);
      }
    );
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    setHistory(prev => [...prev, { type: 'user', text: textInput }]);
    handleAIResponse(textInput);
    setTextInput('');
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="voice-assistant-drawer"
        aria-label="Open Voice Assistant"
        className={`fixed bottom-20 right-4 z-40 bg-gradient-to-r from-[#6c63ff] to-[#4b45bd] p-4 rounded-full shadow-[0_0_20px_rgba(108,99,255,0.4)] text-white hover:scale-105 focus:ring-2 focus:ring-purple-500 transition-transform ${isListening ? 'animate-pulse ring-4 ring-[#6c63ff]/50' : ''}`}
      >
        <Mic size={24} />
      </button>

      {isOpen && (
        <div id="voice-assistant-drawer" className="fixed inset-x-0 bottom-16 z-50 bg-[#13131a] border-t border-gray-800 rounded-t-3xl shadow-2xl h-[350px] max-h-[60vh] flex flex-col transform transition-transform md:max-w-md md:mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h3 className="font-bold text-white flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#6c63ff] mr-2 animate-pulse"></span>
              VenueIQ Assistant
            </h3>
            <button onClick={() => setIsOpen(false)} aria-label="Close Assistant" className="text-gray-400 hover:text-white focus:ring-2 focus:ring-purple-500 rounded p-1">
              <X size={20} />
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-live="polite">
            {history.map((m, i) => (
              <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${m.type === 'user' ? 'bg-[#2a2a35] text-white rounded-br-none' : 'bg-[#1a1a24] text-white border border-gray-700 rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Controls */}
          <div className="p-3 border-t border-gray-800 bg-[#0a0a0f]">
            <p className="text-[10px] text-gray-500 text-center mb-2 italic">Voice features work best in Google Chrome</p>
            <div className="flex space-x-2">
              <form onSubmit={handleTextSubmit} className="flex-1 flex bg-[#1a1a24] border border-gray-700 rounded-full px-4 py-2">
                <label htmlFor="assistant-input" className="sr-only">Type a message</label>
                <input 
                  id="assistant-input"
                  type="text" 
                  value={textInput} 
                  onChange={e => setTextInput(e.target.value)} 
                  placeholder="Ask me anything..." 
                  className="bg-transparent text-sm w-full outline-none text-white focus:ring-0"
                />
                <button type="submit" aria-label="Send Message" className="text-[#6c63ff] ml-2 focus:ring-2 focus:ring-purple-500 rounded-full p-1"><Send size={16}/></button>
              </form>
              <button 
                onClick={handleMicClick}
                aria-label="Start Voice Recognition"
                className={`p-3 rounded-full bg-[#6c63ff] text-white focus:ring-2 focus:ring-purple-500 transition-all ${isListening ? 'animate-pulse shadow-[0_0_15px_rgba(108,99,255,0.6)]' : ''}`}
              >
                <Mic size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
