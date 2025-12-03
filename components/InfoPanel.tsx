import React from 'react';
import { WallStats, Processor } from '../types';
import { CheckCircle2, AlertTriangle, Monitor, Zap, Scale, Ruler, Grid, Route, Cable } from 'lucide-react';
import { PROCESSORS } from '../constants';

interface InfoPanelProps {
  stats: WallStats;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ stats }) => {
  
  const getProcessorStatus = (proc: Processor) => {
    const isPixelOver = stats.totalPixels > proc.maxPixels;
    const isWidthOver = stats.totalPixelsW > proc.maxWidth;
    const isHeightOver = stats.totalPixelsH > proc.maxHeight;
    
    if (isPixelOver || isWidthOver || isHeightOver) {
      return { compatible: false, reason: isPixelOver ? 'Capacidade Excedida' : 'Dimensão Excedida' };
    }
    const usage = (stats.totalPixels / proc.maxPixels) * 100;
    return { compatible: true, usage };
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Monitor className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Resolução</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats.totalPixelsW} <span className="text-gray-500">x</span> {stats.totalPixelsH}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {(stats.totalPixels / 1000000).toFixed(2)} Mpx Total
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Carga Elétrica</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {(stats.totalMaxPowerW / 1000).toFixed(2)} <span className="text-sm text-gray-500">kW</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Méd: {(stats.totalAvgPowerW / 1000).toFixed(2)} kW (c/ Reservas)
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <Scale className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Peso</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {stats.totalWeightKg} <span className="text-sm text-gray-500">kg</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {stats.totalCabinets} Painéis ({stats.totalCabinets - stats.activeCabinets} extras)
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Ruler className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Dimensões</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {(stats.linearWidthMm / 1000).toFixed(2)}<span className="text-gray-500">m</span> L
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Altura: {(stats.totalHeightMm / 1000).toFixed(2)}m
          </div>
        </div>
      </div>

      {/* Curve & Data Mapping Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Curve Stats */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Route className="w-5 h-5 text-gray-400"/>
                Curvatura & Geometria
            </h3>
            {stats.curveRadiusMm ? (
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                        <span className="text-gray-400 text-sm">Raio da Curva</span>
                        <span className="text-cyan-400 font-mono font-bold">{(stats.curveRadiusMm / 1000).toFixed(2)} m</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                        <span className="text-gray-400 text-sm">Ângulo Total</span>
                        <span className="text-white font-mono">{Math.abs(stats.totalCurveAngle).toFixed(1)}°</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                        <span className="text-gray-400 text-sm">Tipo de Curva</span>
                        <span className="text-white font-mono">{stats.totalCurveAngle > 0 ? 'Côncava (Fechada)' : 'Convexa (Aberta)'}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Comprimento do Arco</span>
                        <span className="text-white font-mono">{(stats.totalWidthMm / 1000).toFixed(2)} m</span>
                    </div>
                </div>
            ) : (
                <div className="h-32 flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-800 rounded-lg">
                    <span className="text-sm">Configuração Plana Padrão</span>
                    <span className="text-xs mt-1">Defina um ângulo &gt; 0 para ver dados de curvatura</span>
                </div>
            )}
          </div>

          {/* Data Mapping Estimates */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Cable className="w-5 h-5 text-gray-400"/>
                Estimativa de Dados
            </h3>
            <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-gray-400 text-sm">Portas Ethernet Estimadas</span>
                    <div className="flex items-center gap-2">
                         <span className="text-yellow-400 font-mono font-bold text-lg">{stats.estimatedPorts}</span>
                         <span className="text-xs text-gray-600">(~650k px/porta)</span>
                    </div>
                </div>
                 <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-gray-400 text-sm">Painéis Ativos</span>
                    <span className="text-white font-mono">{stats.activeCabinets} pçs</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                    <span className="text-gray-400 text-sm">Painéis Reserva (Spare)</span>
                    <span className="text-white font-mono">{stats.totalCabinets - stats.activeCabinets} pçs</span>
                </div>
                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Mapa de Pixels</div>
                    <div className="font-mono text-sm text-cyan-300">
                        X: 0 - {stats.totalPixelsW}px <br/>
                        Y: 0 - {stats.totalPixelsH}px
                    </div>
                </div>
            </div>
          </div>

      </div>

      {/* Processor Compatibility */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Grid className="w-5 h-5 text-gray-400"/>
            Compatibilidade de Processadora
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROCESSORS.map(proc => {
            const status = getProcessorStatus(proc);
            return (
              <div key={proc.id} className={`flex items-center justify-between p-3 rounded-lg border ${status.compatible ? 'bg-gray-800 border-gray-700' : 'bg-red-900/10 border-red-900/30'}`}>
                <div>
                  <div className="font-medium text-gray-200">{proc.name}</div>
                  <div className="text-xs text-gray-500">{proc.brand}</div>
                </div>
                <div className="text-right">
                    {status.compatible ? (
                        <div className="flex flex-col items-end">
                            <div className="flex items-center text-green-400 gap-1 text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" /> Compatível
                            </div>
                            <span className="text-xs text-gray-500">{status.usage?.toFixed(1)}% Carga</span>
                        </div>
                    ) : (
                        <div className="flex items-center text-red-400 gap-1 text-sm font-medium">
                            <AlertTriangle className="w-4 h-4" /> {status.reason}
                        </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;