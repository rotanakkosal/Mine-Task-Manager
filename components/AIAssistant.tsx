
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from '../types.ts';

interface AIAssistantProps {
  onTasksExtracted: (tasks: Omit<Task, 'id' | 'createdAt' | 'isCompleted'>[]) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onTasksExtracted }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type,
              },
            },
            {
              text: "Analyze this image (syllabus, whiteboard, or notes). Extract academic tasks. Return them as a JSON array of objects with 'title', 'dueDate' (YYYY-MM-DD), 'priority' (High, Medium, Low), and 'category' (e.g., Math, Science, Personal).",
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                dueDate: { type: Type.STRING },
                priority: { type: Type.STRING },
                category: { type: Type.STRING },
              },
              required: ["title", "dueDate", "priority", "category"],
            },
          },
        },
      });

      const text = response.text;
      if (text) {
        const extracted = JSON.parse(text);
        onTasksExtracted(extracted);
      }
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      analyzeImage(file);
    }
  };

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2rem] p-6 md:p-8 text-white shadow-xl shadow-blue-500/10 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-grow text-center md:text-left">
          <h3 className="text-xl font-bold mb-2">AI Magic Extractor</h3>
          <p className="text-blue-100/90 text-[13px] md:text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
            Upload a photo of your syllabus, notes, or whiteboard to automatically generate and categorize your task list.
          </p>
        </div>
        
        <div className="flex-shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className={`px-6 py-4 bg-white text-blue-600 font-bold rounded-2xl text-[13px] shadow-lg hover:bg-blue-50 transition-all flex flex-col items-center gap-1 min-w-[120px] ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Extracting...</span>
              </div>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                <span>Upload Photo</span>
              </>
            )}
          </button>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
      {error && (
        <div className="mt-4 px-4 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-medium border border-red-100 text-center animate-in fade-in duration-300">
          {error}
        </div>
      )}
    </div>
  );
};
