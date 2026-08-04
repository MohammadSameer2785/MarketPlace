import React, { useState, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

const VoiceInput = ({ 
  value, 
  onChange, 
  placeholder, 
  className = '',
  lang = 'en-IN',
  disabled = false 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  React.useEffect(() => {
    // Check if Speech Recognition is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = lang;

      recognitionRef.current.onresult = (event) => {
        const results = Array.from(event.results || []);
        const transcript = results
          .map(result => result[0]?.transcript || '')
          .join('');
        
        onChange(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access.');
        } else {
          alert('Speech recognition error: ' + event.error);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsSupported(false);
    }
  }, [onChange, lang]);

  const toggleListening = () => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pr-12 ${className}`}
        rows={3}
        disabled={disabled}
      />
      
      {isSupported && (
        <button
          type="button"
          onClick={toggleListening}
          disabled={disabled}
          className={`absolute right-2 top-2 p-2 rounded-full transition-colors ${
            isListening 
              ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isListening ? 'Stop recording' : 'Start voice input'}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </button>
      )}
      
      {!isSupported && (
        <div className="absolute right-2 top-2 p-2">
          <Volume2 className="w-4 h-4 text-gray-400" title="Voice input not supported in this browser" />
        </div>
      )}
      
      {isListening && (
        <div className="absolute -top-8 left-0 bg-red-600 text-white px-2 py-1 rounded text-xs">
          Listening...
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
