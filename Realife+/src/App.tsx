import React, { useState, useEffect } from 'react';
import { type FinancialContext, type Goal, type Transaction } from './types';
import GoalCard from './components/GoalCard';
import Chatbot from './components/Chatbot';
import { IncomeExpenseChart, CategoryPieChart } from './components/ChartComponents';
import { WalletIcon, TrendingUpIcon, TrendingDownIcon, UserIcon, PieChartIcon } from './components/Icons';

// Default Data (Used only if LocalStorage is empty)
const DEFAULT_GOALS: Goal[] = [
  {
    id: '1',
    name: 'AirPods Pro 2',
    targetAmount: 249,
    currentAmount: 0,
    deadline: '2024-12-25',
    icon: 'headphones',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: '2',
    name: 'Dream Vacation',
    targetAmount: 2000,
    currentAmount: 500,
    deadline: '2025-06-01',
    icon: 'plane',
    color: 'from-cyan-500 to-blue-500'
  }
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: '1', date: new Date().toISOString().split('T')[0], category: 'Income', amount: 3000, type: 'income', merchant: 'Initial Balance' },
];

const DEFAULT_CONTEXT: FinancialContext = {
  totalBalance: 3000,
  monthlyIncome: 3000,
  monthlyExpense: 0,
  topExpenseCategory: 'None',
  goals: DEFAULT_GOALS,
  recentTransactions: DEFAULT_TRANSACTIONS
};

const STORAGE_KEY = 'neonbudget_data_v1';

const StatCard = ({ title, value, subtext, icon, trend }: any) => (
  <div className="bg-surface border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : trend === 'down' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-700/50 text-slate-400'}`}>
        {icon}
      </div>
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-white mt-1">{value}</p>
    <p className="text-xs text-slate-500 mt-2">{subtext}</p>
  </div>
);

export default function App() {
  // Load initial state from LocalStorage or Fallback
  const [context, setContext] = useState<FinancialContext>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_CONTEXT;
    } catch (e) {
      console.error("Failed to load state", e);
      return DEFAULT_CONTEXT;
    }
  });

  // Persist to LocalStorage whenever context changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
  }, [context]);

  // Actions exposed to the Chatbot (Tool Registry)
  const chatbotActions = {
    add_transaction: (args: any) => {
      const { merchant, amount, category, type, date } = args;
      const numAmount = Number(amount);
      
      const newTx: Transaction = {
        id: Date.now().toString(),
        merchant: merchant || 'Unknown',
        amount: numAmount,
        category: category || 'General',
        type: type as 'income' | 'expense',
        date: date || new Date().toISOString().split('T')[0]
      };

      setContext(prev => {
        const newBalance = type === 'income' 
          ? prev.totalBalance + numAmount 
          : prev.totalBalance - numAmount;
        
        const newExpense = type === 'expense' 
          ? prev.monthlyExpense + numAmount 
          : prev.monthlyExpense;

        // Simple logic to determine top category
        // In a real app, this would recalculate aggregates
        const currentTop = type === 'expense' ? category : prev.topExpenseCategory;

        return {
          ...prev,
          totalBalance: newBalance,
          monthlyExpense: newExpense,
          topExpenseCategory: currentTop,
          recentTransactions: [newTx, ...prev.recentTransactions]
        };
      });

      return `Transaction added: ${type} of $${numAmount} at ${merchant}.`;
    },

    create_goal: (args: any) => {
      const { name, targetAmount, deadline } = args;
      const newGoal: Goal = {
        id: Date.now().toString(),
        name,
        targetAmount: Number(targetAmount),
        currentAmount: 0,
        deadline: deadline || '2025-12-31',
        icon: 'star',
        color: 'from-violet-500 to-purple-500'
      };

      setContext(prev => ({
        ...prev,
        goals: [...prev.goals, newGoal]
      }));

      return `Goal created: ${name} targeting $${targetAmount}.`;
    },

    update_income: (args: any) => {
      const { amount } = args;
      setContext(prev => ({
        ...prev,
        monthlyIncome: Number(amount)
      }));
      return `Monthly income updated to $${amount}.`;
    }
  };

  const resetData = () => {
    if(confirm("Are you sure you want to reset all data?")) {
      setContext(DEFAULT_CONTEXT);
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 p-4 md:p-8 flex flex-col md:flex-row gap-6 overflow-hidden max-w-[1600px] mx-auto">
      
      {/* Left Column: Dashboard */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-0 md:pr-2 scrollbar-hide h-[calc(100vh-4rem)]">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              NeonBudget
            </h1>
            <p className="text-sm text-slate-400">AI-Powered Finance</p>
          </div>
          <div className="flex gap-2">
             <button onClick={resetData} className="text-xs text-slate-500 hover:text-red-400 transition-colors px-3">
               Reset Data
             </button>
            <button className="p-2 rounded-full bg-surface border border-white/5 hover:bg-slate-800 transition-colors">
              <UserIcon className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </header>

        {/* Key Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Balance" 
            value={`$${context.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
            subtext="Available funds"
            icon={<WalletIcon className="w-5 h-5" />}
            trend={context.totalBalance > 0 ? 'up' : 'down'}
          />
          <StatCard 
            title="Monthly Income" 
            value={`$${context.monthlyIncome.toLocaleString()}`} 
            subtext="Recurring"
            icon={<TrendingUpIcon className="w-5 h-5" />}
            trend="up"
          />
          <StatCard 
            title="Monthly Spend" 
            value={`$${context.monthlyExpense.toLocaleString()}`} 
            subtext={`Top: ${context.topExpenseCategory}`}
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
              </div>
            </div>
            {/* Note: In a real app, pass dynamic data here. For now we keep the beautiful mock chart for visuals */}
            <IncomeExpenseChart />
          </div>

          {/* Goal Section */}
          <div className="lg:col-span-1 flex flex-col gap-4">
             {context.goals.length > 0 ? (
               <GoalCard goal={context.goals[0]} />
             ) : (
               <div className="bg-surface border border-white/5 rounded-2xl p-6 flex items-center justify-center h-[200px] text-slate-500 text-sm">
                 No active goals. Ask Neo to create one!
               </div>
             )}
             
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

        {/* Transactions */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6 mb-4">
          <h2 className="text-lg font-bold text-white mb-4">Recent Transactions</h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide">
            {context.recentTransactions.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">No transactions yet.</p>
            )}
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

      {/* Right Column: Chatbot */}
      <div className="w-full md:w-[350px] lg:w-[400px] h-[500px] md:h-[calc(100vh-4rem)] flex-shrink-0">
        <Chatbot context={context} actions={chatbotActions} />
      </div>

    </div>
  );
}