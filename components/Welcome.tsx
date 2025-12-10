import React, { useRef, useState } from 'react';
import { Upload, Camera, Calculator, BookOpen, Bot } from 'lucide-react';
import { Button } from './Button';

interface WelcomeProps {
  onImageSelect: (file: File) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onImageSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Check if it's an image
      if (e.dataTransfer.files[0].type.startsWith('image/')) {
        onImageSelect(e.dataTransfer.files[0]);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-700">
      <div className="text-center max-w-2xl mb-10">
        <div className="inline-flex items-center justify-center p-3 mb-6 bg-white rounded-full shadow-lg text-primary">
          <BookOpen size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Your Personal <span className="text-primary">Socratic Tutor</span>
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          I don't just solve problems; I help you understand them. 
          Upload a photo of your math problem, and we'll work through it together, step-by-step.
        </p>
      </div>

      <div 
        className={`w-full max-w-lg p-8 bg-white rounded-3xl border-2 border-dashed transition-all duration-300 ${
          isDragging ? 'border-primary bg-indigo-50 scale-[1.02]' : 'border-gray-200 hover:border-primary/50'
        } shadow-xl`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-6">
          <div className="p-4 bg-indigo-50 rounded-full text-primary">
            <Camera size={40} strokeWidth={1.5} />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-gray-800">Upload a math problem</h3>
            <p className="text-sm text-gray-500">Drag & drop or click to browse</p>
          </div>

          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full"
          >
            <Upload size={20} />
            Select Image
          </Button>

          <p className="text-xs text-gray-400 text-center mt-2">
            Supported formats: JPG, PNG, WEBP
          </p>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center max-w-4xl w-full">
        {[
          { icon: <Calculator size={24} />, title: "Step-by-Step", desc: "No skipped steps. We move at your pace." },
          { icon: <Bot size={24} />, title: "Interactive", desc: "Ask 'Why?' anytime to get a deeper explanation." },
          { icon: <BookOpen size={24} />, title: "Concept Focused", desc: "Learn the method, not just the answer." },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 mx-auto bg-gray-50 rounded-full flex items-center justify-center text-gray-600 mb-3">
              {item.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};