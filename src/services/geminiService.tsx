import { GoogleGenAI, Chat, Type, type FunctionDeclaration } from "@google/genai";
import { type FinancialContext, type ToolRegistry } from '../types';

let chatSession: Chat | null = null;

// Define the tools (functions) the model can use
const tools: FunctionDeclaration[] = [
  {
    name: "add_transaction",
    description: "Add a new financial transaction (expense or income) to the ledger. Updates balance automatically.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        merchant: { type: Type.STRING, description: "Name of the merchant or source" },
        amount: { type: Type.NUMBER, description: "The amount of the transaction" },
        category: { type: Type.STRING, description: "Category like Food, Transport, Tech, etc." },
        type: { type: Type.STRING, enum: ["income", "expense"] },
        date: { type: Type.STRING, description: "Date of transaction in YYYY-MM-DD format" }
      },
      required: ["merchant", "amount", "category", "type"]
    }
  },
  {
    name: "create_goal",
    description: "Create a new saving goal for the user.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Name of the goal (e.g. New Laptop)" },
        targetAmount: { type: Type.NUMBER, description: "Target amount to save" },
        deadline: { type: Type.STRING, description: "Target date YYYY-MM-DD" }
      },
      required: ["name", "targetAmount"]
    }
  },
  {
    name: "update_income",
    description: "Update the user's monthly income setting.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        amount: { type: Type.NUMBER, description: "New monthly income amount" }
      },
      required: ["amount"]
    }
  }
];

const getSystemInstruction = (context: FinancialContext): string => {
  return `You are Neo, a sophisticated AI financial assistant for 'NeonBudget'. 
  
  CURRENT USER FINANCIAL CONTEXT (Initial Snapshot):
  - Total Balance: $${context.totalBalance.toFixed(2)}
  - Monthly Income: $${context.monthlyIncome.toFixed(2)}
  - Monthly Expenses: $${context.monthlyExpense.toFixed(2)}
  - Active Goals: ${context.goals.map(g => `${g.name} ($${g.currentAmount}/$${g.targetAmount})`).join(', ')}

  CAPABILITIES:
  - You can ADD transactions, CREATE goals, and UPDATE income settings using the provided tools.
  - When a user says "I spent $50 on food", CALL the 'add_transaction' function immediately. Do not ask for confirmation unless details are missing.
  - After executing a tool, confirm the action to the user concisely.

  TONE:
  - Modern, Cyberpunk-lite, Professional but Friendly.
  - Keep responses short (under 3 sentences) unless analyzing data.
  `;
};

export const initializeChat = async (context: FinancialContext): Promise<boolean> => {
  try {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      console.error("API_KEY not found");
      return false;
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Initialize chat with tools
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: getSystemInstruction(context),
        tools: [{ functionDeclarations: tools }],
      }
    });
    
    return true;
  } catch (error) {
    console.error("Failed to initialize chat", error);
    return false;
  }
};

export const sendMessageToGemini = async (message: string, toolRegistry: ToolRegistry): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized. Please refresh or check connection.");
  }

  try {
    // 1. Send the user message
    let result = await chatSession.sendMessage({ message });

    // 2. Loop to handle potential function calls (multi-turn)
    while (result.functionCalls && result.functionCalls.length > 0) {
      const functionResponseParts = [];

      for (const call of result.functionCalls) {
        const fn = toolRegistry[call.name as string];
        if (fn) {
          console.log(`Executing tool: ${call.name}`, call.args);
          // Execute the client-side function
          const apiResult = await fn(call.args);
          
          functionResponseParts.push({
            functionResponse: {
              id: call.id,
              name: call.name,
              response: { result: apiResult || "Success" }
            }
          });
        } else {
          console.error(`Tool ${call.name} not found`);
          functionResponseParts.push({
            functionResponse: {
              id: call.id,
              name: call.name,
              response: { error: `Function ${call.name} not found on client.` }
            }
          });
        }
      }

      // 3. Send the execution results back to the model
      if (functionResponseParts.length > 0) {
        result = await chatSession.sendMessage({ message: functionResponseParts });
      } else {
        break; 
      }
    }

    // 4. Return the final text response from the model
    return result.text || "Transaction processed.";
    
  } catch (error) {
    console.error("Gemini Interaction Error:", error);
    return "I encountered a glitch in the matrix while processing that request.";
  }
};