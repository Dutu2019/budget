import React, { useState } from 'react';
import { type Goal } from '../types';
import { XIcon, TargetIcon } from './Icons';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id'>) => void;
}

const COLOR_OPTIONS = [
  { name: 'Pink/Rose', value: 'from-pink-500 to-rose-500', color: '#ec4899' },
  { name: 'Cyan/Blue', value: 'from-cyan-500 to-blue-500', color: '#06b6d4' },
  { name: 'Emerald/Green', value: 'from-emerald-500 to-green-500', color: '#10b981' },
  { name: 'Violet/Purple', value: 'from-violet-500 to-purple-500', color: '#8b5cf6' },
  { name: 'Orange/Amber', value: 'from-orange-500 to-amber-500', color: '#f59e0b' },
];

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || !deadline) return;

    onSave({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount),
      deadline,
      color: selectedColor,
      icon: 'star' // Default icon
    });
    
    // Reset form
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
    setSelectedColor(COLOR_OPTIONS[0].value);
    onClose();
  };

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

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <TargetIcon className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">New Goal</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Goal Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Goal Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. New Car, Europe Trip"
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Amounts Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  step="1"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Saved Already</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  step="1"
                  required
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Date</label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors scheme-dark"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Color Theme</label>
            <div className="flex gap-3">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedColor(opt.value)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === opt.value 
                      ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-white scale-110' 
                      : 'hover:scale-110 opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: opt.color }}
                  title={opt.name}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] mt-4"
          >
            Create Goal
          </button>

        </form>
      </div>
    </div>
  );
};

export default AddGoalModal;