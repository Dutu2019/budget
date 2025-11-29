import React, { useState, useRef, useEffect } from 'react';
import { type ChatMessage, type FinancialContext } from '../types';
import { initializeChat, sendMessageToGemini } from '../services/geminiService';
import { BotIcon, SendIcon, LoaderIcon } from './Icons';

interface ChatbotProps {
  context: FinancialContext;
}

const Chatbot: React.FC<ChatbotProps> = ({ context }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm Neo. How can I help you with your budget today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat when context is available or changes significantly
    initializeChat(context);
  }, [context]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(userMsg.text);
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface/50 border border-white/5 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-surface/80">
        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
          <BotIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Neo Assistant</h3>
          <p className="text-xs text-slate-400">Powered by Gemini 2.5</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-bl-none p-3 border border-white/5 flex items-center gap-2">
              <LoaderIcon className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="text-xs text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-surface/80 border-t border-white/5">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your budget..."
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;