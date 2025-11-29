import React from 'react';
import { type Goal } from '../types';
import { TargetIcon } from './Icons';

interface GoalCardProps {
  goal: Goal;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface border border-white/5 p-6 shadow-xl hover:border-white/10 transition-colors group">
      {/* Background glow effect */}
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${goal.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`}></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Primary Goal</p>
            <h3 className="text-xl font-bold text-white mt-1">{goal.name}</h3>
          </div>
          <div className="p-2 rounded-full bg-slate-800 text-white">
            <TargetIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-3xl font-bold text-white">${goal.currentAmount}</span>
            <span className="text-sm font-medium text-slate-400">of ${goal.targetAmount}</span>
          </div>
          
          <div className="relative h-3 w-full rounded-full bg-slate-800 overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full rounded-full bg-gradient-to-r ${goal.color}`}
              style={{ width: `${percentage}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute top-0 left-0 bottom-0 right-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>{percentage}% Complete</span>
            <span>Target: {goal.deadline}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;