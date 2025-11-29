import React, { useState, useEffect } from 'react';
import { type FinancialContext, type Goal, type Transaction } from './types';
import GoalCard from './components/GoalCard';
import Chatbot from './components/Chatbot';
import { IncomeExpenseChart, CategoryPieChart } from './components/ChartComponents';
import { WalletIcon, TrendingUpIcon, TrendingDownIcon, UserIcon, PieChartIcon } from './components/Icons';

// Mock Data
const MOCK_GOALS: Goal[] = [
  {
    id: '1',
    name: 'AirPods Pro 2',
    targetAmount: 249,
    currentAmount: 180,
    deadline: '2023-12-25',
    icon: 'headphones',
    color: 'from-pink-500 to-rose-500' // Using Tailwind gradient classes
  },
  {
    id: '2',
    name: 'Bali Trip',
    targetAmount: 2000,
    currentAmount: 850,
    deadline: '2024-06-01',
    icon: 'plane',
    color: 'from-cyan-500 to-blue-500'
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2023-10-24', category: 'Food', amount: 45.50, type: 'expense', merchant: 'Whole Foods' },
  { id: '2', date: '2023-10-23', category: 'Transport', amount: 12.00, type: 'expense', merchant: 'Uber' },
  { id: '3', date: '2023-10-22', category: 'Income', amount: 2500.00, type: 'income', merchant: 'Salary' },
  { id: '4', date: '2023-10-21', category: 'Tech', amount: 29.99, type: 'expense', merchant: 'Netflix' },
  { id: '5', date: '2023-10-20', category: 'Shopping', amount: 120.00, type: 'expense', merchant: 'Nike' },
];

const MOCK_CONTEXT: FinancialContext = {
  totalBalance: 12450.75,
  monthlyIncome: 4200,
  monthlyExpense: 2350,
  topExpenseCategory: 'Housing',
  goals: MOCK_GOALS,
  recentTransactions: MOCK_TRANSACTIONS
};

const StatCard = ({ title, value, subtext, icon, trend }: any) => (
  <div className="bg-surface border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
          {trend === 'up' ? '+12.5%' : '-2.4%'}
        </span>
      )}
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-white mt-1">{value}</p>
    <p className="text-xs text-slate-500 mt-2">{subtext}</p>
  </div>
);

export default function App() {
  const [context, setContext] = useState<FinancialContext>(MOCK_CONTEXT);

  return (
    <div className="min-h-screen bg-background text-slate-100 p-4 md:p-8 flex flex-col md:flex-row gap-6 overflow-hidden mx-auto">
      
      {/* Left Column: Dashboard (2/3 width on desktop) */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-0 md:pr-2 scrollbar-hide h-[calc(100vh-4rem)]">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              NeonBudget
            </h1>
            <p className="text-sm text-slate-400">Welcome back, Alex</p>
          </div>
          <button className="p-2 rounded-full bg-surface border border-white/5 hover:bg-slate-800 transition-colors">
            <UserIcon className="w-5 h-5 text-slate-300" />
          </button>
        </header>

        {/* Key Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Balance" 
            value={`$${context.totalBalance.toLocaleString()}`} 
            subtext="Available funds"
            icon={<WalletIcon className="w-5 h-5" />}
            trend="up"
          />
          <StatCard 
            title="Monthly Income" 
            value={`$${context.monthlyIncome.toLocaleString()}`} 
            subtext="Main source: Salary"
            icon={<TrendingUpIcon className="w-5 h-5" />}
            trend="up"
          />
          <StatCard 
            title="Monthly Spend" 
            value={`$${context.monthlyExpense.toLocaleString()}`} 
            subtext="20% under budget"
            icon={<TrendingDownIcon className="w-5 h-5" />}
            trend="down"
          />
        </div>

        {/* Main Charts & Goals Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart Section */}
          <div className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Cash Flow</h2>
              <div className="flex gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-white/5 cursor-pointer hover:bg-slate-700">Month</span>
                <span className="text-xs px-3 py-1 rounded-full bg-indigo-600 text-white cursor-pointer shadow-lg shadow-indigo-500/20">Year</span>
              </div>
            </div>
            <IncomeExpenseChart />
          </div>

          {/* Goal Section */}
          <div className="lg:col-span-1 flex flex-col gap-4">
             <GoalCard goal={context.goals[0]} />
             
             {/* Secondary small chart */}
             <div className="bg-surface border border-white/5 rounded-2xl p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                   <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                     <PieChartIcon className="w-4 h-4" />
                   </div>
                   <h3 className="text-sm font-bold text-white">Spending</h3>
                </div>
                <div className="flex-1 min-h-[150px]">
                  <CategoryPieChart />
                </div>
             </div>
          </div>

        </div>

        {/* Transactions (Simplified) */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {context.recentTransactions.map(t => (
              <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-xl transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                    {t.type === 'income' ? <TrendingUpIcon className="w-5 h-5" /> : <TrendingDownIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-white group-hover:text-indigo-400 transition-colors">{t.merchant}</p>
                    <p className="text-xs text-slate-500">{t.date} • {t.category}</p>
                  </div>
                </div>
                <span className={`font-semibold ${t.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                  {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
        <div>
          {/* Chatbot*/}
          <Chatbot context={context} />
        </div>
    </div>
  );
}