import { useState } from 'react';
import { type Transaction } from '../types';
import { XIcon, TrendingUpIcon, TrendingDownIcon, RepeatIcon } from './Icons';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSave }) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('Food');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !merchant) return;

    onSave({
      amount: parseFloat(amount),
      merchant,
      category,
      type,
      isRecurring,
      recurringFrequency: isRecurring ? frequency : undefined
    });
    
    // Reset form
    setAmount('');
    setMerchant('');
    setCategory('Food');
    setIsRecurring(false);
    setFrequency('monthly');
    onClose();
  };

  const categories = type === 'expense' 
    ? ['Food', 'Transport', 'Books', 'Leisure', 'Housing', 'Tech', 'Entertainment', 'Shopping', 'Utilities']
    : ['Salary', 'Part-time Job', 'Freelance', 'Investment', 'Gift', 'Other'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md bg-surface border border-white/10 rounded-2xl shadow-2xl p-6 animate-[fadeIn_0.2s_ease-out]">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Add Transaction</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                type === 'expense' 
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingDownIcon className="w-4 h-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                type === 'income' 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUpIcon className="w-4 h-4" />
              Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Merchant */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Merchant / Description</label>
            <input
              type="text"
              required
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder={type === 'expense' ? "e.g. Starbucks, Uber" : "e.g. Salary, Client Payment"}
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors appearance-none"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Recurring Section */}
          <div className="space-y-3">
            <div 
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                isRecurring ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-slate-900 border-white/5 hover:border-white/10'
              }`}
              onClick={() => setIsRecurring(!isRecurring)}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                isRecurring ? 'bg-indigo-500 border-indigo-500' : 'border-slate-500'
              }`}>
                {isRecurring && <RepeatIcon className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isRecurring ? 'text-indigo-400' : 'text-slate-300'}`}>Recurring Transaction</p>
                <p className="text-xs text-slate-500">{isRecurring ? 'How often does this repeat?' : 'Does this transaction repeat?'}</p>
              </div>
            </div>

            {/* Frequency Selector - Only show if recurring */}
            {isRecurring && (
              <div className="grid grid-cols-3 gap-2 pl-2 animate-[fadeIn_0.2s_ease-out]">
                {(['weekly', 'monthly', 'yearly'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequency(freq)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                      frequency === freq
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
                    }`}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] mt-2"
          >
            Save Transaction
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
