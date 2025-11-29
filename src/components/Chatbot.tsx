import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { type ChatMessage, type FinancialContext, type Transaction,type Goal } from '../types';
import { initializeChat, getChatSession } from '../services/geminiService';
import { BotIcon, SendIcon, LoaderIcon } from './Icons';

export interface ChatbotHandle {
  sendMessage: (text: string) => void;
}

interface ChatbotProps {
  context: FinancialContext;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
}

const Chatbot = forwardRef<ChatbotHandle, ChatbotProps>(({ context, onAddTransaction, onAddGoal }, ref) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm Neo. Tell me about your spending or new goals, and I'll update your dashboard.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat(context);
  }, [context.totalBalance]); // Re-init when balance changes to keep context fresh

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processUserMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const chat = getChatSession();
      if (!chat) throw new Error("Chat not initialized");

      let result = await chat.sendMessage({ message: userMsg.text });
      
      // Handle Function Calls loop
      const functionCalls = result.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
         const functionResponses = [];

         for (const call of functionCalls) {
            // Fix: Destructure with default value to handle undefined args
            const { name, args = {} } = call;
            let functionResult = { result: 'Success' };

            if (name === 'addTransaction') {
               onAddTransaction({
                  amount: args.amount as number,
                  type: args.type as 'income' | 'expense',
                  category: args.category as string,
                  merchant: args.merchant as string,
                  isRecurring: args.isRecurring as boolean,
                  recurringFrequency: args.recurringFrequency as any
               });
               functionResult = { result: `Transaction added: ${args.merchant} $${args.amount}` };
            } else if (name === 'addGoal') {
               onAddGoal({
                  name: args.name as string,
                  targetAmount: args.targetAmount as number,
                  deadline: args.deadline as string || new Date().toISOString().split('T')[0],
                  currentAmount: 0,
                  icon: 'star',
                  color: 'from-violet-500 to-purple-500'
               });
               functionResult = { result: `Goal created: ${args.name}` };
            }

            functionResponses.push({
               id: call.id,
               name: call.name,
               response: functionResult
            });
         }

         // Send result back to model
         result = await chat.sendMessage({
            message: functionResponses.map(fr => ({ functionResponse: fr }))
         });
      }

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text || "Done.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, modelMsg]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
         id: Date.now().toString(),
         role: 'model',
         text: "I encountered a connection error. Please try again.",
         timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim()) {
      await processUserMessage(input);
      setInput('');
    }
  };

  useImperativeHandle(ref, () => ({
    sendMessage: (text: string) => {
      processUserMessage(text);
    }
  }));

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
              <span className="text-xs text-slate-400">Processing...</span>
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
            placeholder="Try 'Add expense $20 for Pizza'..."
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
});

export default Chatbot;