import React, { useState, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import { CABINETS } from './constants';
import { WallConfig, WallStats, Tab } from './types';
import Visualizer from './components/Visualizer';
import InfoPanel from './components/InfoPanel';
import { Layers, Settings2, BarChart3, ChevronRight, Box, Camera, Download, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<WallConfig>({
    rows: 6,
    cols: 10,
    cabinetId: CABINETS[1].id, // Default to P2.6
    curveAngle: 0,
    spares: 2,
  });

  const [activeTab, setActiveTab] = useState<Tab>(Tab.VISUALIZER);
  const [isExporting, setIsExporting] = useState(false);
  
  // Ref for the element we want to capture (The main content area)
  const exportRef = useRef<HTMLDivElement>(null);

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

  const handleExport = async () => {
    if (!exportRef.current) return;
    
    setIsExporting(true);
    
    try {
      // Add a small delay to ensure UI is ready/rendered if tabs just switched (optional safety)
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(exportRef.current, {
        scale: 2, // High resolution
        backgroundColor: '#111827', // Matches bg-gray-900
        logging: false,
        useCORS: true, // Helps with loading external assets if any
      });

      const image = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      link.href = image;
      link.download = `led-config-${config.cols}x${config.rows}-${timestamp}.jpg`;
      link.click();
    } catch (error) {
      console.error("Erro ao exportar imagem:", error);
      alert("Houve um erro ao gerar a imagem. Tente novamente.");
    } finally {
      setIsExporting(false);
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
          <div className="flex items-center gap-4">
             <button 
               onClick={handleExport}
               disabled={isExporting}
               className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               title="Salvar visualização atual como imagem"
             >
               {isExporting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Camera className="w-4 h-4" />}
               <span className="hidden sm:inline">Exportar JPG</span>
             </button>
             <span className="text-xs font-mono text-gray-500 hidden sm:inline">v1.2.0 (PT-BR)</span>
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
                      // Added pr-10 to prevent overlap with "pçs"
                      className="w-full bg-gray-950 border border-gray-700 text-white font-mono rounded-lg p-2.5 pl-3 pr-10 text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-600 font-mono pointer-events-none">pçs</span>
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
                      // Added pr-10 to prevent overlap with "pçs"
                      className="w-full bg-gray-950 border border-gray-700 text-white font-mono rounded-lg p-2.5 pl-3 pr-10 text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-600 font-mono pointer-events-none">pçs</span>
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
                      // Added pr-14 to prevent overlap with "graus"
                      className={`w-full bg-gray-950 border text-white font-mono rounded-lg p-2.5 pl-3 pr-14 text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none ${config.curveAngle !== 0 ? 'border-cyan-500/50' : 'border-gray-700'}`}
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-600 font-mono pointer-events-none">graus</span>
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
                      // Added pr-10
                      className="w-full bg-gray-950 border border-gray-700 text-white font-mono rounded-lg p-2.5 pl-3 pr-10 text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-600 font-mono pointer-events-none"><Box className="w-3 h-3 inline"/></span>
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
          </div>

          {/* Content Area - Ref attached here for export */}
          <div 
            ref={exportRef}
            className="flex-1 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden relative shadow-2xl min-h-[600px]"
          >
             {activeTab === Tab.VISUALIZER && (
                <Visualizer config={config} cabinet={selectedCabinet} stats={stats} />
             )}
             {activeTab === Tab.DATA && (
                <div className="p-6 h-full overflow-y-auto custom-scrollbar">
                    <InfoPanel stats={stats} />
                </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;