'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronUp } from 'lucide-react';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: string;
  isFree: boolean;
  isPremium?: boolean;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3',
    description: 'Modèle puissant et rapide',
    provider: 'Meta',
    isFree: true,
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct',
    name: 'Llama 3.1 Fast',
    description: 'Ultra rapide pour les réponses simples',
    provider: 'Meta',
    isFree: true,
  },
  {
    id: 'mistralai/mixtral-8x7b-instruct',
    name: 'Mixtral 8x7B',
    description: 'Excellent pour l\'analyse de documents',
    provider: 'Mistral',
    isFree: true,
  },
  {
    id: 'google/gemma-2-9b-it',
    name: 'Gemma 2',
    description: 'Modèle Google compact et efficace',
    provider: 'Google',
    isFree: true,
  },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

export default function ModelSelector({ selectedModel, onModelChange, className = '' }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all text-sm"
      >
        <span className="text-zinc-200">{currentModel.name}</span>
        <ChevronUp className={`h-4 w-4 text-zinc-400 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-zinc-800">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">AGENTS IA</span>
          </div>
          
          <div className="py-2">
            {AI_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-start justify-between hover:bg-zinc-800/50 transition-colors ${
                  selectedModel === model.id ? 'bg-zinc-800/30' : ''
                }`}
              >
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{model.name}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      model.isFree 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {model.isFree ? 'GRATUIT' : 'PREMIUM'}
                    </span>
                  </div>
                  <span className="text-sm text-zinc-500">{model.description}</span>
                </div>
                {selectedModel === model.id && (
                  <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-1" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
