import React, { useState, useMemo } from 'react';
import { CABINETS } from './constants';
import { WallConfig, WallStats, Tab } from './types';
import Visualizer from './components/Visualizer';
import InfoPanel from './components/InfoPanel';
import AIAdvice from './components/AIAdvice';
import { Layers, Settings2, BarChart3, Bot, ChevronRight, Box } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<WallConfig>({
    rows: 6,
    cols: 10,
    cabinetId: CABINETS[1].id, // Default to P2.6
    curveAngle: 0,
    spares: 2,
  });

  const [activeTab, setActiveTab] = useState<Tab>(Tab.VISUALIZER);

  const selectedCabinet = useMemo(() => 
    CABINETS.find(c => c.id === config.cabinetId) || CABINETS[0], 
  [config.cabinetId]);

  const stats: WallStats = useMemo(() => {
    const activeCabinets = config.cols * config.rows;
    const totalCabinets = activeCabinets + (config.spares || 0);

    const totalPixelsW = config.cols * selectedCabinet.pixelsW;
    const totalPixelsH = config.rows * selectedCabinet.pixelsH;
    const totalPixels = totalPixelsW * totalPixelsH;
    
    // Physical dimensions (Arc length if curved, roughly)
    const arcWidthMm = config.cols * selectedCabinet.widthMm;
    const totalHeightMm = config.rows * selectedCabinet.heightMm;

    // Curve Math
    let curveRadiusMm = null;
    let linearWidthMm = arcWidthMm;
    let totalCurveAngle = 0;

    if (config.curveAngle !== 0) {
      // Radius = Width / (2 * sin(angle/2))
      // Angle must be in radians for Math functions
      const angleRad = (Math.abs(config.curveAngle) * Math.PI) / 180;
      curveRadiusMm = selectedCabinet.widthMm / (2 * Math.sin(angleRad / 2));
      
      // Total Angle
      totalCurveAngle = config.curveAngle * (config.cols - 1);
      const totalAngleRad = (Math.abs(totalCurveAngle) * Math.PI) / 180;

      // Chord length (Linear width from end to end)
      // C = 2 * R * sin(TotalAngle / 2)
      linearWidthMm = 2 * curveRadiusMm * Math.sin(totalAngleRad / 2);
    }

    // Port Estimation (Standard conservative ~650k pixels per port)
    const pixelsPerPort = 655360; 
    const estimatedPorts = Math.ceil(totalPixels / pixelsPerPort);

    return {
      totalWidthMm: arcWidthMm, // This is the surface width
      linearWidthMm, // This is the physical space width
      totalHeightMm,
      totalPixelsW,
      totalPixelsH,
      totalPixels,
      aspectRatio: totalPixelsH > 0 ? totalPixelsW / totalPixelsH : 0,
      totalWeightKg: totalCabinets * selectedCabinet.weightKg,
      totalMaxPowerW: totalCabinets * selectedCabinet.maxPowerW,
      totalAvgPowerW: totalCabinets * selectedCabinet.avgPowerW,
      curveRadiusMm,
      totalCurveAngle,
      activeCabinets,
      totalCabinets,
      estimatedPorts
    };
  }, [config, selectedCabinet]);

  const handleDimensionChange = (field: keyof WallConfig, val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setConfig(prev => ({ ...prev, [field]: num }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Layers className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
              LED Master<span className="font-light text-cyan-400">Calc</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
             <span>v1.2.0 (PT-BR)</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Sidebar: Controls */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 shadow-xl">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> Configuração
            </h2>
            
            {/* Cabinet Selector */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Modelo de Gabinete</label>
                <select
                  value={config.cabinetId}
                  onChange={(e) => setConfig({ ...config, cabinetId: e.target.value })}
                  className="w-full bg-gray-950 border border-gray-700 text-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all"
                >
                  {CABINETS.map(cab => (
                    <option key={cab.id} value={cab.id}>
                      P{cab.pitch} - {cab.model} ({cab.widthMm}x{cab.heightMm})
                    </option>
                  ))}
                </select>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Colunas (L)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={config.cols}
                      onChange={(e) => handleDimensionChange('cols', e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 text-white font-mono rounded-lg p-2.5 pl-3 text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-600 font-mono">pçs</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Linhas (A)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={config.rows}
                      onChange={(e) => handleDimensionChange('rows', e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 text-white font-mono rounded-lg p-2.5 pl-3 text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-600 font-mono">pçs</span>
                  </div>
                </div>
              </div>

              {/* Curve Control */}
              <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Ângulo (por painel)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="-15"
                      max="15"
                      step="0.5"
                      value={config.curveAngle}
                      onChange={(e) => handleDimensionChange('curveAngle', e.target.value)}
                      className={`w-full bg-gray-950 border text-white font-mono rounded-lg p-2.5 pl-3 text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none ${config.curveAngle !== 0 ? 'border-cyan-500/50' : 'border-gray-700'}`}
                    />
                    <span className="absolute right-8 top-2.5 text-xs text-gray-600 font-mono">graus</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1">
                      <span>Convexo (-)</span>
                      <span>Plano (0)</span>
                      <span>Côncavo (+)</span>
                  </div>
              </div>

               {/* Spares / Extras */}
               <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 flex justify-between">
                    <span>Gabinetes Reserva</span>
                    <span className="text-xs text-gray-600">Estoque</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      value={config.spares}
                      onChange={(e) => handleDimensionChange('spares', e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 text-white font-mono rounded-lg p-2.5 pl-3 text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-600 font-mono"><Box className="w-3 h-3 inline"/></span>
                  </div>
                </div>

              {/* Quick Size Preview */}
              <div className="pt-4 border-t border-gray-800">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500">Tam. Gabinete</span>
                   <span className="font-mono text-gray-300">{selectedCabinet.widthMm} x {selectedCabinet.heightMm} mm</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                   <span className="text-gray-500">Resolução</span>
                   <span className="font-mono text-gray-300">{selectedCabinet.pixelsW} x {selectedCabinet.pixelsH} px</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700 p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bot className="w-16 h-16 text-cyan-400" />
            </div>
            <h3 className="text-white font-semibold mb-2 relative z-10">Engenheiro IA</h3>
            <p className="text-sm text-gray-400 mb-4 relative z-10">
                Pergunte sobre energia, sinal ou requisitos para setups curvos.
            </p>
            <button 
                onClick={() => setActiveTab(Tab.AI_ASSISTANT)}
                className="w-full bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 rounded-lg py-2 px-4 text-sm font-medium transition-all flex items-center justify-center gap-2 relative z-10"
            >
                Perguntar IA <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center/Right: Visualizer & Data */}
        <div className="lg:col-span-9 flex flex-col gap-6 h-full">
            
          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-lg w-fit border border-gray-800 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab(Tab.VISUALIZER)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === Tab.VISUALIZER ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
            >
              <Layers className="w-4 h-4" /> Visualizador
            </button>
            <button
              onClick={() => setActiveTab(Tab.DATA)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === Tab.DATA ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
            >
              <BarChart3 className="w-4 h-4" /> Dados & Mapeamento
            </button>
            <button
              onClick={() => setActiveTab(Tab.AI_ASSISTANT)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === Tab.AI_ASSISTANT ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`}
            >
              <Bot className="w-4 h-4" /> Assistente IA
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden relative shadow-2xl min-h-[600px]">
             {activeTab === Tab.VISUALIZER && (
                <Visualizer config={config} cabinet={selectedCabinet} stats={stats} />
             )}
             {activeTab === Tab.DATA && (
                <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                    <InfoPanel stats={stats} />
                </div>
             )}
             {activeTab === Tab.AI_ASSISTANT && (
                <AIAdvice stats={stats} cabinet={selectedCabinet} />
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;