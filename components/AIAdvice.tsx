import React, { useState } from 'react';
import { WallStats, Cabinet } from '../types';
import { getTechnicalAdvice } from '../services/geminiService';
import { Sparkles, Send, Loader2, Info } from 'lucide-react';

interface AIAdviceProps {
  stats: WallStats;
  cabinet: Cabinet;
}

const AIAdvice: React.FC<AIAdviceProps> = ({ stats, cabinet }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const advice = await getTechnicalAdvice(stats, cabinet, query);
      setResponse(advice);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Essa resolução é adequada para apresentações em PowerPoint?",
    "Qual distribuição de energia você recomenda?",
    "Calcule a distância mínima de visualização para este pixel pitch.",
    "Esse setup funciona com uma fonte de conteúdo padrão 1080p?"
  ];

  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gray-800/30">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Assistente Técnico IA
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Tire dúvidas técnicas sobre sua configuração {cabinet.pitch}mm.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!response && !loading && (
          <div className="text-center py-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 mb-4">
              <Info className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm mb-4">Selecione uma pergunta comum ou digite a sua abaixo.</p>
            <div className="flex flex-col gap-2 max-w-md mx-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(s)}
                  className="text-left text-sm p-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors border border-gray-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-purple-400" />
            <p className="text-sm">Analisando configuração...</p>
          </div>
        )}

        {response && (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-500 uppercase font-bold mb-1">Sua Pergunta</div>
              <div className="text-gray-200">{query}</div>
            </div>
            <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-3">
                 <Sparkles className="w-4 h-4 text-purple-400" />
                 <div className="text-xs text-purple-300 uppercase font-bold">Análise da IA</div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-gray-200 whitespace-pre-line leading-relaxed">
                {response}
              </div>
            </div>
            <button 
                onClick={() => setResponse(null)}
                className="text-sm text-gray-500 hover:text-white underline"
            >
                Fazer outra pergunta
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pergunte sobre sinal, energia, cabos..."
            className="flex-1 bg-gray-900 border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !query.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAdvice;