import React, { useState, useRef, useEffect } from 'react';
import { type ChatMessage, type FinancialContext, type ToolRegistry } from '../types';
import { initializeChat, sendMessageToGemini } from '../services/geminiService';
import { BotIcon, SendIcon, LoaderIcon } from './Icons';

interface ChatbotProps {
  context: FinancialContext;
  actions: ToolRegistry;
}

type ChatStatus = 'initializing' | 'ready' | 'error';

const Chatbot: React.FC<ChatbotProps> = ({ context, actions }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm Neo. I can track expenses and set goals for you. Try saying 'I bought coffee for $5'.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<ChatStatus>('initializing');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize once on mount
  useEffect(() => {
    let active = true;
    
    const init = async () => {
      setStatus('initializing');
      const success = await initializeChat(context);
      if (active) {
        setStatus(success ? 'ready' : 'error');
      }
    };

    init();

    return () => { active = false; };
  }, []); // Empty dependency array ensures run once

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, status]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading || status !== 'ready') return;

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
      // Pass the registry of actions to the service
      const responseText = await sendMessageToGemini(userMsg.text, actions);
      
      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "System Error: Unable to process request.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface/50 border border-white/5 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-surface/80">
        <div className={`p-2 rounded-lg ${status === 'ready' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700/50 text-slate-400'}`}>
          <BotIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            Neo Assistant
            {status === 'initializing' && <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse"/>}
            {status === 'ready' && <span className="flex h-2 w-2 rounded-full bg-emerald-500"/>}
            {status === 'error' && <span className="flex h-2 w-2 rounded-full bg-red-500"/>}
          </h3>
          <p className="text-xs text-slate-400">
            {status === 'initializing' ? 'Initializing...' : status === 'error' ? 'Offline' : 'Connected'}
          </p>
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
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-900/20'
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
              <span className="text-xs text-slate-400">Processing...</span>
            </div>
          </div>
        )}
        {status === 'error' && messages.length === 1 && (
             <div className="flex justify-center mt-10">
                <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl max-w-xs">
                    <p className="text-red-400 text-sm font-medium">Connection Failed</p>
                    <p className="text-red-400/70 text-xs mt-1">Check your API Key settings.</p>
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
            disabled={status !== 'ready' || isLoading}
            placeholder={status === 'ready' ? "Ask to add expense or goal..." : "Connecting..."}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || status !== 'ready'}
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