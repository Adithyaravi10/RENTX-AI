import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Minimize2, Trash2, Mic, MicOff, Zap, Send } from 'lucide-react';
import { aiApi } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { useGeolocation } from '../../hooks/useGeolocation';

export default function ChatbotWidget() {
  const { user, isAuthenticated } = useAuth();
  const { location } = useGeolocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm RentX AI 🚗 How can I help you find the perfect ride today?",
      suggestions: ['Find EV vehicles', 'Check surge pricing', 'Nearest charging station'],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (e) => {
        setInput(e.results[0][0].transcript);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const sendMessage = async (text) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMsg = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

      const { data } = await aiApi.post('/api/ai/chat', {
        message: messageText,
        history,
        userId: user?.id,
        location,
        currentBooking: null,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply,
          suggestions: data.suggestions || [],
          intent: data.intent,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting. Try asking about vehicles, pricing, or EV charging!",
          suggestions: ['Browse vehicles', 'View pricing'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared! How can I help you?",
        suggestions: ['Find vehicles', 'Eco tips'],
      },
    ]);
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-brand-cyan to-brand-violet flex items-center justify-center shadow-lg ${!isOpen ? 'block' : 'hidden'}`}
        whileHover={{ scale: 1.1 }}
        animate={loading ? { rotate: 360 } : {}}
        transition={loading ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
      >
        {!loading && (
          <span className="absolute inset-0 rounded-full border-2 border-brand-cyan animate-ping opacity-50" />
        )}
        <MessageCircle size={24} className="text-black relative z-10" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[400px] z-50 flex flex-col bg-card-bg border-l border-card-border shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-brand-dark">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center">
                  <Zap size={16} className="text-brand-cyan" />
                </div>
                <div>
                  <p className="font-syne font-bold text-white">RentX AI</p>
                  <p className="text-xs text-brand-green">● Online</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={clearChat} className="text-gray-400 hover:text-white p-1"><Trash2 size={16} /></button>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1"><Minimize2 size={16} /></button>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1"><X size={16} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-brand-cyan/20 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <Zap size={14} className="text-brand-cyan" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-brand-cyan to-brand-cyan/80 text-black rounded-br-sm'
                          : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.suggestions?.length > 0 && msg.role === 'assistant' && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => sendMessage(s)}
                            className="text-xs px-3 py-1 rounded-full border border-brand-cyan/30 text-brand-cyan hover:bg-brand-cyan/10 transition"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 ml-9">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-brand-cyan rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleVoice}
                  className={`p-2 rounded-xl transition ${isListening ? 'bg-brand-red/20 text-brand-red' : 'text-gray-400 hover:text-white'}`}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask RentX AI anything..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan/50"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading}
                  className="p-2.5 bg-brand-cyan rounded-xl text-black hover:opacity-90 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
