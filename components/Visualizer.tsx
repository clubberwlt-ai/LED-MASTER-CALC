import React, { useMemo } from 'react';
import { WallConfig, Cabinet, WallStats } from '../types';

interface VisualizerProps {
  config: WallConfig;
  cabinet: Cabinet;
  stats: WallStats;
}

const Visualizer: React.FC<VisualizerProps> = ({ config, cabinet, stats }) => {
  const isCurved = config.curveAngle !== 0;

  // --- Front View Calculations ---
  const frontTotalW = config.cols * cabinet.widthMm;
  const frontTotalH = config.rows * cabinet.heightMm;
  // Reduce padding slightly to maximize view area
  const frontPadding = Math.max(frontTotalW, frontTotalH) * 0.15;
  const frontViewBox = `${-frontPadding} ${-frontPadding} ${frontTotalW + frontPadding * 2} ${frontTotalH + frontPadding * 2}`;
  
  // Font size calculation: dynamic but clamped to look good on screen
  const dimFontSize = Math.max(cabinet.widthMm * 0.4, Math.min(frontTotalW, frontTotalH) * 0.08);

  // --- Top View (Curve) Calculations ---
  const topViewData = useMemo(() => {
    if (!isCurved || !stats.curveRadiusMm) return null;

    const radius = stats.curveRadiusMm;
    const angleRadAbs = (Math.abs(config.curveAngle) * Math.PI) / 180;
    const isConcave = config.curveAngle > 0;
    
    // Geometry Logic:
    // To ensure edges touch perfectly, we construct the polygon based on the Screen Face.
    // The "Radius" in stats is the circumradius (center to corner of the face).
    // The "Apothem" is the distance from circle center to the midpoint of the face.
    const apothem = radius * Math.cos(angleRadAbs / 2);

    // Cabinet Dimensions
    const cabDepth = Math.max(150, cabinet.widthMm * 0.3); // Visual depth
    const cabWidth = cabinet.widthMm;

    const totalArcRad = angleRadAbs * config.cols;
    const startAngle = -totalArcRad / 2 + angleRadAbs / 2;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const cabinets = [];

    // Helper to rotate point
    const rotatePoint = (x: number, y: number, angleDeg: number) => {
        const rad = angleDeg * Math.PI / 180;
        return {
            x: x * Math.cos(rad) - y * Math.sin(rad),
            y: x * Math.sin(rad) + y * Math.cos(rad)
        };
    };

    for (let i = 0; i < config.cols; i++) {
        const theta = startAngle + (i * angleRadAbs);
        
        // --- Position Calculation ---
        // Pivot Point (Face Center) is exactly on the Apothem radius
        const pivotX = apothem * Math.sin(theta);
        const pivotY = apothem * Math.cos(theta); // Start at "12 o'clock" relative to center

        // 2. Determine Body Center
        const depthOffset = isConcave ? (cabDepth / 2) : -(cabDepth / 2);
        
        const cx = pivotX + (depthOffset * Math.sin(theta));
        const cy = pivotY + (depthOffset * Math.cos(theta));

        // 3. Rotation
        let rotation = -theta * (180 / Math.PI);
        
        cabinets.push({ x: cx, y: cy, rotation });

        // Update Bounds based on corners of the rotated cabinet rectangle
        const corners = [
            { x: -cabWidth/2, y: -cabDepth/2 },
            { x: cabWidth/2, y: -cabDepth/2 },
            { x: cabWidth/2, y: cabDepth/2 },
            { x: -cabWidth/2, y: cabDepth/2 },
        ];

        corners.forEach(corner => {
            const rotated = rotatePoint(corner.x, corner.y, rotation);
            const wx = rotated.x + cx;
            const wy = rotated.y + cy;
            
            if (wx < minX) minX = wx;
            if (wx > maxX) maxX = wx;
            if (wy < minY) minY = wy;
            if (wy > maxY) maxY = wy;
        });
    }

    // Add generous padding
    const paddingX = (maxX - minX) * 0.15 + 200;
    const paddingY = (maxY - minY) * 0.15 + 200;
    
    const vbW = (maxX - minX) + paddingX * 2;
    const vbH = (maxY - minY) + paddingY * 2;
    const vbX = minX - paddingX;
    const vbY = minY - paddingY;

    return {
        cabinets,
        viewBox: `${vbX} ${vbY} ${vbW} ${vbH}`,
        cabDepth,
        isConcave
    };

  }, [isCurved, config.cols, config.curveAngle, stats.curveRadiusMm, cabinet.widthMm]);


  const renderFrontGrid = useMemo(() => {
    const rects = [];
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c * cabinet.widthMm}
            y={r * cabinet.heightMm}
            width={cabinet.widthMm}
            height={cabinet.heightMm}
            fill="#1e293b" // slate-800
            stroke="#38bdf8" // sky-400
            // Change: Use non-scaling-stroke with a fixed small width for hairline precision
            strokeWidth="1.5" 
            vectorEffect="non-scaling-stroke"
            className="transition-all duration-300 hover:fill-sky-900/50"
          />
        );
      }
    }
    return rects;
  }, [config.rows, config.cols, cabinet.widthMm, cabinet.heightMm]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Main View Area (Front) */}
      <div className={`flex-1 flex flex-col ${isCurved ? 'h-1/2 border-b border-gray-800' : 'h-full'}`}>
        {/* Header Bar for Front View */}
        <div className="flex justify-between items-center px-4 py-2 bg-gray-900/30 border-b border-gray-800/50">
            <span className="text-xs text-gray-500 font-mono font-medium">DIMENSÕES</span>
            <div className="bg-gray-800/80 px-2 py-0.5 rounded text-[10px] text-gray-400 font-mono border border-gray-700">
                VISTA FRONTAL • {config.cols}x{config.rows}
            </div>
        </div>
        
        <div className="flex-1 relative overflow-hidden p-4 flex items-center justify-center bg-gray-950/20">
            <svg
                viewBox={frontViewBox}
                className="w-full h-full drop-shadow-2xl"
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: 'visible' }}
            >
                <defs>
                   <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.8"/>
                   </filter>
                </defs>

                {/* Dimensions Text - Top (Width) */}
                <text 
                    x={frontTotalW / 2} 
                    y={-frontPadding * 0.4} 
                    textAnchor="middle" 
                    fill="#e2e8f0" 
                    fontSize={dimFontSize} 
                    className="font-mono font-medium tracking-wider"
                    filter="url(#textShadow)"
                >
                    {isCurved ? `~${(stats.linearWidthMm / 1000).toFixed(2)}m (Corda)` : `${(stats.totalWidthMm / 1000).toFixed(2)}m`}
                </text>

                {/* Dimensions Text - Left (Height) */}
                <text 
                    x={-frontPadding * 0.4} 
                    y={frontTotalH / 2} 
                    textAnchor="middle" 
                    fill="#e2e8f0" 
                    fontSize={dimFontSize} 
                    className="font-mono font-medium tracking-wider" 
                    transform={`rotate(-90 ${-frontPadding * 0.4} ${frontTotalH / 2})`}
                    filter="url(#textShadow)"
                >
                    {(stats.totalHeightMm / 1000).toFixed(2)}m
                </text>

                <g opacity="0.9">
                    {renderFrontGrid}
                </g>
            </svg>
        </div>
      </div>

      {/* Top View (Only if curved) */}
      {isCurved && topViewData && (
          <div className="h-[45%] flex flex-col bg-gray-900">
             {/* Header Bar for Top View */}
             <div className="flex justify-between items-center px-4 py-2 bg-gray-900/50 border-b border-gray-800/50">
                 <div className="flex gap-4 text-[10px] text-gray-500 font-mono">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-cyan-500/20 border border-cyan-500 rounded-sm"></div> Face</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-800 border border-gray-600 rounded-sm"></div> Traseira</div>
                 </div>
                 <div className="bg-gray-800/80 px-2 py-0.5 rounded text-[10px] text-cyan-400 font-mono border border-cyan-900/30">
                    VISTA SUPERIOR ({topViewData.isConcave ? 'CÔNCAVA' : 'CONVEXA'})
                 </div>
             </div>

             <div className="flex-1 relative p-4 flex items-center justify-center overflow-hidden">
                <svg
                    viewBox={topViewData.viewBox}
                    className="w-full h-full"
                    preserveAspectRatio="xMidYMid meet"
                    style={{ overflow: 'visible' }}
                >
                    <defs>
                    <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#000" floodOpacity="1"/>
                    </filter>
                    </defs>

                    {/* Center Axis Line */}
                    <line 
                        x1="0" y1="-50000" x2="0" y2="50000" 
                        stroke="#334155" 
                        strokeDasharray="20,20" 
                        strokeWidth="2" // Thinner axis line 
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Draw Cabinets Top View */}
                    {topViewData.cabinets.map((pos, idx) => (
                        <g key={idx} transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotation})`}>
                            {/* Cabinet Body */}
                            <rect 
                                x={-cabinet.widthMm/2} 
                                y={-topViewData.cabDepth/2} 
                                width={cabinet.widthMm} 
                                height={topViewData.cabDepth} 
                                fill="#1e293b" 
                                stroke="#475569"
                                strokeWidth={cabinet.widthMm * 0.005} // Proportional thin stroke (~2.5mm for 500mm cab)
                            />
                            
                            {/* Screen Face Indicator */}
                            <line 
                                x1={-cabinet.widthMm/2} 
                                y1={topViewData.isConcave ? -topViewData.cabDepth/2 : topViewData.cabDepth/2} 
                                x2={cabinet.widthMm/2} 
                                y2={topViewData.isConcave ? -topViewData.cabDepth/2 : topViewData.cabDepth/2} 
                                stroke="#06b6d4" 
                                strokeWidth={cabinet.widthMm * 0.02} // ~10mm for 500mm cab, visible but not huge
                                strokeLinecap="round"
                            />
                            
                            {/* Connector visual dots */}
                            <circle cx={cabinet.widthMm/2} cy="0" r={cabinet.widthMm * 0.015} fill="#64748b" />
                            <circle cx={-cabinet.widthMm/2} cy="0" r={cabinet.widthMm * 0.015} fill="#64748b" />
                        </g>
                    ))}

                    {/* Radius/Info Text placed near the curve apex */}
                    <text 
                        x="0" 
                        y={topViewData.isConcave ? (stats.curveRadiusMm! + (cabinet.widthMm * 0.8)) : (stats.curveRadiusMm! - (cabinet.widthMm * 0.8))} 
                        textAnchor="middle" 
                        fill="#fbbf24" 
                        fontSize={cabinet.widthMm * 0.15} // Smaller font relative to cabinet
                        className="font-mono font-bold"
                        filter="url(#textGlow)"
                        dominantBaseline="middle"
                    >
                        R = {(stats.curveRadiusMm! / 1000).toFixed(2)}m
                    </text>
                </svg>
             </div>
          </div>
      )}
    </div>
  );
};

export default Visualizer;