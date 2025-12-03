export interface Cabinet {
  id: string;
  model: string;
  brand: string;
  pitch: number; // mm
  widthMm: number;
  heightMm: number;
  pixelsW: number;
  pixelsH: number;
  weightKg: number;
  maxPowerW: number;
  avgPowerW: number;
}

export interface Processor {
  id: string;
  name: string;
  brand: string;
  maxPixels: number;
  maxWidth: number;
  maxHeight: number;
}

export interface WallConfig {
  rows: number;
  cols: number;
  cabinetId: string;
  curveAngle: number; // Degrees per cabinet (0 = flat, >0 concave, <0 convex)
  spares: number; // Extra cabinets
}

export interface WallStats {
  totalWidthMm: number;
  totalHeightMm: number;
  totalPixelsW: number;
  totalPixelsH: number;
  totalPixels: number;
  aspectRatio: number;
  totalWeightKg: number;
  totalMaxPowerW: number;
  totalAvgPowerW: number;
  // Curve stats
  curveRadiusMm: number | null;
  totalCurveAngle: number;
  linearWidthMm: number; // Width of the chord (straight line distance)
  // Mapping stats
  activeCabinets: number;
  totalCabinets: number;
  estimatedPorts: number; // Assuming ~650k pixels per port standard
}

export enum Tab {
  VISUALIZER = 'VISUALIZER',
  DATA = 'DATA',
  AI_ASSISTANT = 'AI_ASSISTANT'
}