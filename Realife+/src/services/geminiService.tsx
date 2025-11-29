import { GoogleGenAI, Chat, type FunctionDeclaration, Type } from "@google/genai";
import { type FinancialContext } from '../types';

let chatSession: Chat | null = null;

// Define Tools
const addTransactionTool: FunctionDeclaration = {
  name: 'addTransaction',
  description: 'Add a new financial transaction (income or expense) to the budget tracker.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, enum: ['income', 'expense'], description: 'Is this money coming in (income) or going out (expense)?' },
      amount: { type: Type.NUMBER, description: 'The numerical amount of the transaction.' },
      category: { type: Type.STRING, description: 'Category like Food, Transport, Tech, Housing, Salary, etc.' },
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
  return `You are Neo, a sophisticated AI financial assistant.
  
  CURRENT USER FINANCIAL CONTEXT:
  - Total Balance: $${context.totalBalance.toLocaleString()}
  - Monthly Income: $${context.monthlyIncome.toLocaleString()}
  - Monthly Expenses: $${context.monthlyExpense.toLocaleString()}
  - Goals: ${context.goals.map(g => `${g.name} ($${g.currentAmount}/$${g.targetAmount})`).join(', ')}
  
  CAPABILITIES:
  You can modify the user's budget database directly. 
  - If a user says "I spent $50 on food", CALL the 'addTransaction' tool.
  - If a user says "I want to save $500 for a PS5", CALL the 'addGoal' tool.
  
  TONE:
  Concise, modern, futuristic. Use emojis sparingly.
  `;
};

export const initializeChat = async (context: FinancialContext) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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

// Return the full chat object to handle function calls in UI
export const getChatSession = () => chatSession;