import { useState, useEffect, useMemo, useRef } from "react";
import { type FinancialContext, type Goal, type Transaction } from "./types";
import GoalCard from "./components/GoalCard";
import Chatbot, { type ChatbotHandle } from "./components/Chatbot";
import {
  IncomeExpenseChart,
  CategoryPieChart,
} from "./components/ChartComponents";
import {
  WalletIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UserIcon,
  PieChartIcon,
  PlusIcon,
  RepeatIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TargetIcon,
  TrashIcon,
  BotIcon,
} from "./components/Icons";
import AddTransactionModal from "./components/AddTransactionModal";
import AddGoalModal from "./components/AddGoalModal";
import ProfileModal from "./components/ProfileModal";

// Mock Data for initial state if empty
const MOCK_GOALS: Goal[] = [
  {
    id: "1",
    name: "Spring Break Trip",
    targetAmount: 800,
    currentAmount: 350,
    deadline: "2024-03-15",
    icon: "star",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: "2",
    name: "New Laptop",
    targetAmount: 1200,
    currentAmount: 400,
    deadline: "2024-08-20",
    icon: "laptop",
    color: "from-cyan-500 to-blue-500",
  },
];

// Student-oriented initial transactions
const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    date: new Date().toISOString().split("T")[0],
    category: "Income",
    amount: 1200.0,
    type: "income",
    merchant: "Part-time Job",
  },
  {
    id: "2",
    date: new Date().toISOString().split("T")[0],
    category: "Books",
    amount: 85.0,
    type: "expense",
    merchant: "University Bookstore",
  },
  {
    id: "3",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    category: "Food",
    amount: 25.5,
    type: "expense",
    merchant: "Campus Cafeteria",
  },
  {
    id: "4",
    date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    category: "Transport",
    amount: 45.0,
    type: "expense",
    merchant: "Monthly Bus Pass",
  },
  {
    id: "5",
    date: new Date(Date.now() - 259200000).toISOString().split("T")[0],
    category: "Leisure",
    amount: 15.0,
    type: "expense",
    merchant: "Cinema Student Ticket",
  },
];

const StatCard = ({ title, value, subtext, icon, trend }: any) => (
  <div className="bg-surface border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div
        className={`p-2 rounded-lg ${
          trend === "up"
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-rose-500/10 text-rose-400"
        }`}
      >
        {icon}
      </div>
    </div>
    <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-white mt-1">{value}</p>
    <p className="text-xs text-slate-500 mt-2">{subtext}</p>
  </div>
);

export default function App() {
  const [userName, setUserName] = useState(
    () => localStorage.getItem("neon_username") || "Student"
  );

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("neon_transactions");
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("neon_goals");
    return saved ? JSON.parse(saved) : MOCK_GOALS;
  });

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [currentGoalIndex, setCurrentGoalIndex] = useState(0);
  const [chartView, setChartView] = useState<"month" | "year">("month"); // Default to month for better detail

  const chatbotRef = useRef<ChatbotHandle>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem("neon_username", userName);
  }, [userName]);
  useEffect(() => {
    localStorage.setItem("neon_transactions", JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    localStorage.setItem("neon_goals", JSON.stringify(goals));
  }, [goals]);

  // --- Actions ---

  const handleAddTransaction = (newTx: Omit<Transaction, "id" | "date">) => {
    const transaction: Transaction = {
      ...newTx,
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    };
    setTransactions((prev) => [transaction, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddGoal = (newGoal: Omit<Goal, "id">) => {
    const goal: Goal = {
      ...newGoal,
      id: Date.now().toString(),
    };
    setGoals((prev) => [...prev, goal]);
    setCurrentGoalIndex(goals.length);
  };

  const handleDeleteGoal = (id: string) => {
    const newGoals = goals.filter((g) => g.id !== id);
    setGoals(newGoals);
    if (currentGoalIndex >= newGoals.length) {
      setCurrentGoalIndex(Math.max(0, newGoals.length - 1));
    }
  };

  const handleAddFundsToGoal = (amount: number) => {
    if (goals.length === 0) return;

    // 1. Update Goal Amount
    const updatedGoals = [...goals];
    const goal = updatedGoals[currentGoalIndex];
    goal.currentAmount += amount;
    setGoals(updatedGoals);

    // 2. Create Expense Transaction
    handleAddTransaction({
      amount: amount,
      type: "expense",
      category: "Savings",
      merchant: `Transfer to ${goal.name}`,
    });
  };

  const handleResetData = () => {
    localStorage.removeItem("neon_transactions");
    localStorage.removeItem("neon_goals");
    localStorage.removeItem("neon_username");
    window.location.reload();
  };

  const handleAskNeoAnalysis = () => {
    if (chatbotRef.current) {
      const now = new Date();
      const monthName = now.toLocaleString("default", { month: "long" });
      const prompt =
        chartView === "month"
          ? `Analyze my rolling 30-day cash flow (centered on today, ${monthName} ${now.getDate()}). Look at my recent transaction history. Do I have any spending spikes? What categories are highest?`
          : `Analyze my yearly spending trends based on my transaction history. Am I saving enough?`;

      chatbotRef.current.sendMessage(prompt);
    }
  };

  const nextGoal = () =>
    setCurrentGoalIndex((prev) => (prev + 1) % goals.length);
  const prevGoal = () =>
    setCurrentGoalIndex((prev) => (prev - 1 + goals.length) % goals.length);

  // --- Context Calculation ---

  const context: FinancialContext = useMemo(() => {
    const startBalance = 0; // Assuming 0 start, purely based on transactions history
    const totalBalance =
      startBalance +
      transactions.reduce(
        (acc, t) => acc + (t.type === "income" ? t.amount : -t.amount),
        0
      );

    const monthlyIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const monthlyExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    // Calculate top category
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryTotals[t.category] =
          (categoryTotals[t.category] || 0) + t.amount;
      });

    let topExpenseCategory = "None";
    let maxVal = 0;
    Object.entries(categoryTotals).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val;
        topExpenseCategory = cat;
      }
    });

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      topExpenseCategory,
      goals: goals,
      recentTransactions: transactions,
    };
  }, [transactions, goals]);

  return (
    <div className="min-h-screen bg-background text-slate-100 p-4 md:p-8 flex flex-col md:flex-row gap-6 overflow-hidden mx-auto">
      <AddTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={handleAddTransaction}
      />

      <AddGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSave={handleAddGoal}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userName={userName}
        onUpdateName={setUserName}
        onResetData={handleResetData}
      />

      {/* Left Column: Dashboard */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-0 md:pr-2 scrollbar-hide h-[calc(100vh-4rem)]">
        {/* Header */}
        <header className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              Realife+
            </h1>
            <p className="text-sm text-slate-400">Welcome back, {userName}</p>
          </div>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="p-2 rounded-full bg-surface border border-white/5 hover:bg-slate-800 transition-colors"
          >
            <UserIcon className="w-5 h-5 text-slate-300" />
          </button>
        </header>

        {/* Key Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Balance"
            value={`$${context.totalBalance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            subtext="Available funds"
            icon={<WalletIcon className="w-5 h-5" />}
            trend={context.totalBalance >= 0 ? "up" : "down"}
          />
          <StatCard
            title="Total Income"
            value={`$${context.monthlyIncome.toLocaleString()}`}
            subtext="Lifetime inflows"
            icon={<TrendingUpIcon className="w-5 h-5" />}
            trend="up"
          />
          <StatCard
            title="Total Expenses"
            value={`$${context.monthlyExpense.toLocaleString()}`}
            subtext={`${context.topExpenseCategory} is top spend`}
            icon={<TrendingDownIcon className="w-5 h-5" />}
            trend="down"
          />
        </div>

        {/* Charts & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-surface border border-white/5 rounded-2xl p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">Cash Flow</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartView("month")}
                  className={`text-xs px-3 py-1 rounded-full border border-white/5 cursor-pointer transition-all select-none focus:outline-none focus:ring-0 ${
                    chartView === "month"
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  30 Day
                </button>
                <button
                  onClick={() => setChartView("year")}
                  className={`text-xs px-3 py-1 rounded-full border border-white/5 cursor-pointer transition-all select-none focus:outline-none focus:ring-0 ${
                    chartView === "year"
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
            <IncomeExpenseChart view={chartView} transactions={transactions} />

            {/* Ask Neo Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAskNeoAnalysis}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 text-xs font-medium transition-all"
              >
                <BotIcon className="w-3.5 h-3.5" />
                Ask Neo?
              </button>
            </div>
          </div>

          {/* Goal & Pie Chart Column */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Goal Carousel */}
            <div className="relative">
              <div className="flex justify-between items-center mb-2 px-1">
                <h2 className="text-sm font-bold text-slate-400 tracking-wide uppercase">
                  Goals
                </h2>
              </div>

              {goals.length > 0 ? (
                <div className="relative group min-h-[220px]">
                  <GoalCard
                    goal={goals[currentGoalIndex]}
                    label={
                      currentGoalIndex === 0
                        ? "Primary Goal"
                        : `Goal ${currentGoalIndex + 1} of ${goals.length}`
                    }
                    onAddClick={() => setIsGoalModalOpen(true)}
                    onDelete={() =>
                      handleDeleteGoal(goals[currentGoalIndex].id)
                    }
                    onAddFunds={handleAddFundsToGoal}
                  />

                  {goals.length > 1 && (
                    <>
                      <button
                        onClick={prevGoal}
                        className="absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/50 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800"
                      >
                        <ChevronLeftIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextGoal}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-900/50 backdrop-blur-sm border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-800"
                      >
                        <ChevronRightIcon className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {goals.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              idx === currentGoalIndex
                                ? "bg-white"
                                : "bg-white/20"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => setIsGoalModalOpen(true)}
                  className="h-48 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface/50"
                >
                  <div className="p-3 rounded-full bg-slate-800 mb-2">
                    <TargetIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-400">
                    Set a Goal
                  </span>
                </div>
              )}
            </div>

            {/* Pie Chart */}
            <div className="bg-surface border border-white/5 rounded-2xl p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                  <PieChartIcon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Spending</h3>
              </div>
              <div className="flex-1 min-h-[150px]">
                <CategoryPieChart transactions={transactions} />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-surface border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">
              Recent Transactions
            </h2>
            <button
              onClick={() => setIsTxModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
            >
              <PlusIcon className="w-4 h-4" />
              Add New
            </button>
          </div>

          <div className="space-y-4">
            {context.recentTransactions.map((t) => (
              <div
                key={t.id}
                className="flex justify-between items-center p-3 hover:bg-slate-800/50 rounded-xl transition-colors group border border-transparent hover:border-white/5 relative"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      t.type === "income"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {t.type === "income" ? (
                      <div
                        className={`p-2 rounded-lg ${"bg-emerald-500/10 text-emerald-400"}`}
                      >
                        <TrendingUpIcon className="w-5 h-5" />
                      </div>
                    ) : (
                      <div
                        className={`p-2 rounded-lg ${"bg-rose-500/10 text-rose-400"}`}
                      >
                        <TrendingDownIcon className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{t.merchant}</p>
                      {t.isRecurring && (
                        <span
                          title={`Recurring (${
                            t.recurringFrequency || "monthly"
                          })`}
                          className="text-indigo-400 bg-indigo-500/10 p-0.5 rounded"
                        >
                          <RepeatIcon className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {t.date} • {t.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`font-semibold ${
                      t.type === "income" ? "text-emerald-400" : "text-white"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}${t.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTransaction(t.id);
                    }}
                    className="p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete Transaction"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {context.recentTransactions.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No transactions yet. Start by adding one!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Chatbot */}
      <div className="w-full md:w-[350px] lg:w-[400px] h-[500px] md:h-[calc(100vh-4rem)] flex-shrink-0">
        <Chatbot
          ref={chatbotRef}
          context={context}
          onAddTransaction={handleAddTransaction}
          onAddGoal={handleAddGoal}
        />
      </div>
    </div>
  );
}
