import { GoogleGenAI, Chat, type FunctionDeclaration, Type } from "@google/genai";
import { type FinancialContext } from '../types';

let chatSession: Chat | null = null;

// Define Tools
const addTransactionTool: FunctionDeclaration = {
  name: 'addTransaction',
  description: 'Add a new financial transaction (income or expense) to the budget tracker. ONLY call this if the user explicitly states they HAVE spent money or earned money. DO NOT call this for hypothetical scenarios.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, enum: ['income', 'expense'], description: 'Is this money coming in (income) or going out (expense)?' },
      amount: { type: Type.NUMBER, description: 'The numerical amount of the transaction.' },
      category: { type: Type.STRING, description: 'Category like Food, Transport, Tech, Housing, Salary, Books, Leisure, etc.' },
      merchant: { type: Type.STRING, description: 'The name of the store, person, or entity.' },
      isRecurring: { type: Type.BOOLEAN, description: 'Does this happen repeatedly?' },
      recurringFrequency: { type: Type.STRING, enum: ['weekly', 'monthly', 'yearly'], description: 'Frequency if recurring.' }
    },
    required: ['type', 'amount', 'category', 'merchant']
  }
};

const addGoalTool: FunctionDeclaration = {
  name: 'addGoal',
  description: 'Create a new savings goal.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Name of the goal (e.g., New Car).' },
      targetAmount: { type: Type.NUMBER, description: 'Total amount needed.' },
      deadline: { type: Type.STRING, description: 'Target date in YYYY-MM-DD format.' }
    },
    required: ['name', 'targetAmount']
  }
};

const getSystemInstruction = (context: FinancialContext): string => {
  // Summarize recent history for context
  const historySummary = context.recentTransactions
    .slice(0, 15)
    .map(t => `- ${t.date}: ${t.merchant} (${t.category}) $${t.amount} [${t.type}]`)
    .join('\n');

  // Calculate category breakdown for context
  const categories: Record<string, number> = {};
  context.recentTransactions.filter(t => t.type === 'expense').forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });
  const topCategories = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([cat, amount]) => `${cat}: $${amount}`)
    .join(', ');

  return `You are Neo, a sophisticated AI financial assistant for students and young professionals.

  CURRENT FINANCIAL SNAPSHOT:
  - Balance: $${context.totalBalance.toFixed(2)}
  - Monthly In: $${context.monthlyIncome.toFixed(2)} | Out: $${context.monthlyExpense.toFixed(2)}
  - Top Spending: ${topCategories || 'None'}
  
  RECENT TRANSACTIONS (Last 15):
  ${historySummary}
  
  GOALS:
  ${context.goals.map(g => `${g.name} ($${g.currentAmount}/$${g.targetAmount})`).join(', ')}
  
  CRITICAL INSTRUCTIONS:
  1. **Analysis Mode**: If asked to analyze cash flow, trends, or spending habits, use the transaction history provided above. You DO NOT need a tool for this. Just answer based on the data.
  2. **Hypothetical Mode ("What If"):** If the user asks "What if I spend...", "Can I afford...", or "Hypothetically...", do NOT call any tools. Instead, perform a budget simulation in your response. 
     - Example: "If you spend $500 on a PS5, your balance will drop to $X. This might affect your goal for 'Car'."
     - Suggest cuts if the hypothetical expense puts them over budget (e.g., "You spend a lot on ${context.topExpenseCategory}, try cutting that down").
  3. **Action Mode**: Only call 'addTransaction' or 'addGoal' if the user confirms a real action (e.g., "I just bought...", "Add a goal...").

  TONE:
  Concise, encouraging, student-friendly, slightly futuristic.
  `;
};

export const initializeChat = async (context: FinancialContext) => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getSystemInstruction(context),
        tools: [{ functionDeclarations: [addTransactionTool, addGoalTool] }]
      }
    });
    
    chatSession = chat;
    return true;
  } catch (error) {
    console.error("Failed to initialize chat", error);
    return false;
  }
};

export const getChatSession = () => chatSession;
