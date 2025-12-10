import React, { useState, useEffect, useRef } from 'react';
import { Welcome } from './components/Welcome';
import { ChatMessage } from './components/ChatMessage';
import { Button } from './components/Button';
import { Message, StepType } from './types';
import { startChatSession, sendMessage } from './services/geminiService';
import { Send, RefreshCw, ChevronLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [step, setStep] = useState<StepType>(StepType.UPLOAD);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // The result is like "data:image/jpeg;base64,..."
        // The API wants just the base64 part often, but standard inputs handle the prefix well in some contexts.
        // The Gemini SDK helper usually wants just the data part if passing as inlineData.
        const result = reader.result as string;
        // Strip the data:image/xyz;base64, prefix for the API call if manual handling, 
        // but let's see what the service needs. 
        // Service expects base64 data string.
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (file: File) => {
    setIsLoading(true);
    setStep(StepType.CHAT);
    
    // Add temporary user message with image
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fullBase64 = e.target?.result as string;
      const base64Data = fullBase64.split(',')[1];

      const initialUserMsg: Message = {
        id: uuidv4(),
        role: 'user',
        text: 'Can you help me understand this problem?',
        image: fullBase64
      };
      setMessages([initialUserMsg]);

      try {
        const responseText = await startChatSession(base64Data);
        
        const aiMsg: Message = {
          id: uuidv4(),
          role: 'model',
          text: responseText
        };
        setMessages(prev => [...prev, aiMsg]);
      } catch (error) {
        const errorMsg: Message = {
          id: uuidv4(),
          role: 'model',
          text: "I'm sorry, I encountered an error analyzing the image. Please try again.",
          isError: true
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      text: userText
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const responseText = await sendMessage(userText);
      const aiMsg: Message = {
        id: uuidv4(),
        role: 'model',
        text: responseText
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
       const errorMsg: Message = {
          id: uuidv4(),
          role: 'model',
          text: "I'm having trouble connecting right now. Please try again.",
          isError: true
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    setMessages([]);
    setStep(StepType.UPLOAD);
    setInputValue('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step === StepType.CHAT && (
              <button onClick={resetSession} className="md:hidden mr-2 text-gray-500">
                <ChevronLeft />
              </button>
            )}
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-semibold text-lg text-gray-800">Socratic</span>
          </div>
          {step === StepType.CHAT && (
            <Button variant="outline" onClick={resetSession} className="!py-2 !px-3 text-sm">
              <RefreshCw size={16} />
              <span className="hidden md:inline">New Problem</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto">
        {step === StepType.UPLOAD ? (
          <Welcome onImageSelect={handleImageSelect} />
        ) : (
          <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {isLoading && (
                  <div className="flex justify-start w-full animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                      <div className="bg-gray-100 h-10 w-32 rounded-2xl"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shadow-lg">
              <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your answer or ask 'Why?'..."
                    className="w-full pl-5 pr-12 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary/20 text-gray-800 placeholder-gray-400 transition-all outline-none"
                    disabled={isLoading}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-2 p-2 bg-primary text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-300 transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </form>
                <div className="text-center mt-2">
                   <p className="text-xs text-gray-400">
                     AI can make mistakes. Please check important info.
                   </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;