import { GoogleGenAI, Chat, Content, Part } from "@google/genai";

// Initialize Gemini Client
// We assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SOCRATIC_SYSTEM_INSTRUCTION = `
You are a compassionate, patient, and highly skilled Socratic math tutor. 
Your goal is NOT to solve the problem for the user, but to guide them to the solution themselves.

Rules:
1. When an image is provided, identify the math problem (Algebra, Calculus, etc.).
2. Acknowledge the problem difficulty with empathy (e.g., "This looks like a tricky integral!").
3. Ask the user what they think the first step should be.
4. If the user is stuck or asks "Why?", explain ONLY the specific concept needed for the current step.
5. Keep responses concise, encouraging, and conversational. Do not lecture.
6. Use Markdown for math symbols (e.g., *x*^2, $\int$).
7. Never provide the full solution immediately. Go step-by-step.
`;

let chatSession: Chat | null = null;

export const startChatSession = async (imageBase64?: string): Promise<string> => {
  try {
    chatSession = ai.chats.create({
      model: 'gemini-3-pro-preview', // Using Pro for better reasoning capabilities
      config: {
        systemInstruction: SOCRATIC_SYSTEM_INSTRUCTION,
        temperature: 0.7, // Balanced creativity and precision
      },
    });

    let initialPrompt: string | Part[] = "Hi! I'm ready to learn.";

    if (imageBase64) {
      initialPrompt = [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64
          }
        },
        {
          text: "Here is a math problem I need help with. Please act as my Socratic tutor."
        }
      ];
    } else {
        // Fallback text start if no image
        initialPrompt = "I need help with a math problem.";
    }
    
    // We send the first message to initialize the context
    // The SDK's sendMessage can accept an array of parts for multimodal input
    const response = await chatSession.sendMessage({ 
        message: initialPrompt 
    });

    return response.text || "I'm having trouble seeing the problem. Could you try uploading it again?";

  } catch (error) {
    console.error("Failed to start chat session:", error);
    throw error;
  }
};

export const sendMessage = async (text: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const response = await chatSession.sendMessage({ message: text });
    return response.text || "I didn't catch that. Could you say it again?";
  } catch (error) {
    console.error("Failed to send message:", error);
    throw error;
  }
};