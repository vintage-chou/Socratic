import React from 'react';
import { Message } from '../types';
import { Bot, User, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm ${
          isUser ? 'bg-indigo-100 text-indigo-600' : isError ? 'bg-red-100 text-red-500' : 'bg-white text-emerald-600'
        }`}>
          {isUser ? <User size={20} /> : isError ? <AlertCircle size={20} /> : <Bot size={20} />}
        </div>

        {/* Message Bubble */}
        <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden break-words ${
            isUser 
              ? 'bg-primary text-white rounded-tr-sm' 
              : isError
                ? 'bg-red-50 text-red-800 border border-red-100 rounded-tl-sm'
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
          }`}>
            {message.image && (
              <div className="mb-3 rounded-lg overflow-hidden border border-indigo-200/50">
                <img src={message.image} alt="Uploaded math problem" className="w-full max-w-xs h-auto object-cover" />
              </div>
            )}
            <div className="markdown-body">
              {isUser ? (
                <p className="whitespace-pre-wrap">{message.text}</p>
              ) : (
                <ReactMarkdown>{message.text}</ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};