import { GoogleGenAI, ChatSession, GenerativeModel } from "@google/genai";
import { type FinancialContext } from '../types';

let chatSession: ChatSession | null = null;
let model: GenerativeModel | null = null;

const getSystemInstruction = (context: FinancialContext): string => {
  return `You are Neo, a sophisticated AI financial assistant for the 'NeonBudget' app. 
  Your tone is concise, modern, and encouraging. You interpret the user's financial data to provide insights.
  
  CURRENT USER FINANCIAL CONTEXT:
  - Total Balance: $${context.totalBalance.toLocaleString()}
  - Monthly Income: $${context.monthlyIncome.toLocaleString()}
  - Monthly Expenses: $${context.monthlyExpense.toLocaleString()}
  - Top Expense Category: ${context.topExpenseCategory}
  - Active Goals: ${context.goals.map(g => `${g.name} ($${g.currentAmount}/$${g.targetAmount})`).join(', ')}
  - Recent Transactions: ${context.recentTransactions.slice(0, 5).map(t => `${t.merchant} ($${t.amount})`).join(', ')}

  Rules:
  1. If the user asks about their budget, use the provided context numbers.
  2. Keep answers short (under 3 sentences) unless asked for a detailed breakdown.
  3. Be proactive: suggest saving tips if expenses are high.
  4. Use emoji occasionally to keep it friendly.
  `;
};

export const initializeChat = async (context: FinancialContext) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    model = ai.models;
    
    // We create a chat session but we don't strictly need to store it if we re-initialize with context often.
    // However, keeping history is good. Ideally, we update the system instruction dynamically, 
    // but the SDK initializes session with instruction. 
    // For this demo, we'll initialize it once.
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getSystemInstruction(context),
      }
    });
    
    chatSession = chat;
    return true;
  } catch (error) {
    console.error("Failed to initialize chat", error);
    return false;
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const result = await chatSession.sendMessage({
      message: message
    });
    return result.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the financial network right now. Please try again later.";
  }
};