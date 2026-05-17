import { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, Send, X, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export default function AIRecommender({ isArabic }: { isArabic: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = { 
      role: 'user', 
      parts: [{ text: inputText.trim() }] 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: m.parts
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.parts[0].text,
          history: history
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Server error');
      }

      const aiMessage: Message = {
        role: 'model',
        parts: [{ text: data.text }]
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: Message = {
        role: 'model',
        parts: [{ text: isArabic ? 'عذراً، حدث خطأ ما. يرجى المحاولة لاحقاً.' : 'Sorry, something went wrong. Please try again later.' }]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-[85px] right-5 lg:bottom-10 lg:right-10 z-[80]" dir={isArabic ? 'rtl' : 'ltr'}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[90vw] max-w-sm bg-white border border-[#E8E2D9] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#E8E2D9] bg-[#FAF9F6] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4A6741] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4A6741]/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-[#1B2A22] leading-tight">
                    {isArabic ? 'مساعد البراء' : 'Al-Baraa AI'}
                  </h3>
                  <p className="text-[10px] text-[#4A6741] font-black uppercase tracking-widest mt-0.5">
                    {isArabic ? 'متاح الآن' : 'Always Online'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[#E8E2D9] rounded-xl transition-colors text-[#8B7E74]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-6 space-y-4 bg-white hide-scrollbar"
            >
              {messages.length === 0 && (
                <div className="text-center py-8 px-4">
                  <div className="w-12 h-12 bg-[#F2F4EF] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-6 h-6 text-[#4A6741]" />
                  </div>
                  <p className="text-sm text-[#8B7E74] font-bold leading-relaxed">
                    {isArabic 
                      ? 'مرحباً بك! أنا مساعدك الذكي في بن البراء. هل تبحث عن نوع معين من القهوة أو تود معرفة أفضل طريقة للتحضير؟'
                      : 'Welcome! I am your AI assistant at Al-Baraa. Looking for a specific coffee or need brewing tips?'}
                  </p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'user' ? (isArabic ? -10 : 10) : (isArabic ? 10 : -10) }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm font-bold leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#1B2A22] text-white rounded-br-none' 
                      : 'bg-[#F2F4EF] text-[#1B2A22] rounded-bl-none border border-[#E8E2D9]'
                  }`}>
                    {msg.parts[0].text}
                  </div>
                </motion.div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#F2F4EF] p-4 rounded-[1.5rem] rounded-bl-none border border-[#E8E2D9] flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#4A6741] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#4A6741] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-[#4A6741] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#E8E2D9] bg-[#FAF9F6]">
              <div className="relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={isArabic ? 'اكتب رسالتك هنا...' : 'Type your message...'}
                  className="w-full bg-white border border-[#E8E2D9] rounded-2xl py-4 px-6 pr-14 text-sm focus:outline-none focus:border-[#4A6741] transition-colors shadow-inner text-[#1B2A22] font-semibold"
                />
                <button 
                  onClick={sendMessage}
                  disabled={loading || !inputText.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-[#4A6741] text-white rounded-xl hover:bg-[#3D5535] transition-all disabled:opacity-50 active:scale-90"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#1B2A22] rounded-full flex items-center justify-center shadow-2xl border-4 border-white hover:scale-110 active:scale-95 group relative transition-transform"
      >
        <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#4A6741] rounded-full border-2 border-white animate-pulse" />
      </button>
    </div>
  );
}
