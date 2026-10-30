import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VisualType, InteractiveSlider } from '../../types/stem';
import { renderSimulationByType } from './renderers';
import { CanvasTheme } from '../../utils/audioSynthesis';
import { Sliders, RotateCcw, PenTool, Sparkles, Compass } from 'lucide-react';

interface LaserPoint {
  x: number;
  y: number;
  time: number;
  color: string;
}

interface SimulationCanvasProps {
  visualType: VisualType;
  currentTime: number; // in seconds
  isPlaying: boolean;
  baseParameters: Record<string, number>;
  interactiveSliders?: InteractiveSlider[];
  onCanvasRef?: (canvas: HTMLCanvasElement | null) => void;
  theme?: CanvasTheme;
  className?: string;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  visualType,
  currentTime,
  isPlaying,
  baseParameters,
  interactiveSliders = [],
  onCanvasRef,
  theme = '3blue1brown',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active tweakable parameters
  const [params, setParams] = useState<Record<string, number>>(baseParameters);
  const [showSliders, setShowSliders] = useState(false);

  // Innovation 1: Interactive Live Laser Pointer & Magic Chalk
  const [isLaserEnabled, setIsLaserEnabled] = useState(false);
  const [laserPoints, setLaserPoints] = useState<LaserPoint[]>([]);
  const isDrawingRef = useRef(false);

  // Innovation 2: Quantum Telemetry HUD on Hover
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; normX: number; normY: number } | null>(null);

  useEffect(() => {
    setParams(baseParameters);
  }, [baseParameters, visualType]);

  useEffect(() => {
    if (onCanvasRef && canvasRef.current) {
      onCanvasRef(canvasRef.current);
    }
  }, [onCanvasRef]);

  // Handle laser drawing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isLaserEnabled) return;
    isDrawingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLaserPoints((prev) => [...prev, { x, y, time: Date.now(), color: '#f59e0b' }]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update hover coordinates
    setHoverCoord({
      x: Math.round(x),
      y: Math.round(y),
      normX: parseFloat((x / rect.width).toFixed(3)),
      normY: parseFloat(((rect.height - y) / rect.height).toFixed(3)),
    });

    if (!isLaserEnabled || !isDrawingRef.current) return;
    setLaserPoints((prev) => [...prev, { x, y, time: Date.now(), color: '#f59e0b' }]);
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = Math.floor(rect.width);
      const displayHeight = Math.floor(rect.height);

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Render math/physics simulation
      renderSimulationByType(visualType, {
        ctx,
        width: displayWidth,
        height: displayHeight,
        time: currentTime,
        params,
        interactive: showSliders,
      });

      // Render Laser Pointer Trails on top
      const now = Date.now();
      const fadeDuration = 1400; // 1.4 seconds fade

      if (laserPoints.length > 1) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < laserPoints.length; i++) {
          const ptA = laserPoints[i - 1];
          const ptB = laserPoints[i];
          const age = now - ptB.time;

          if (age < fadeDuration) {
            const alpha = 1 - age / fadeDuration;
            ctx.beginPath();
            ctx.moveTo(ptA.x, ptA.y);
            ctx.lineTo(ptB.x, ptB.y);
            ctx.strokeStyle = `rgba(245, 158, 11, ${alpha * 0.9})`;
            ctx.lineWidth = 4;
            ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
            ctx.shadowBlur = 10;
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      ctx.restore();

      // Prune old laser points periodically
      if (laserPoints.length > 0 && Math.random() < 0.1) {
        setLaserPoints((prev) => prev.filter((p) => now - p.time < fadeDuration));
      }

      if (isPlaying || laserPoints.length > 0 || isLaserEnabled) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [visualType, currentTime, isPlaying, params, showSliders, laserPoints, isLaserEnabled, theme]);

  const handleResetParams = () => {
    setParams(baseParameters);
    setLaserPoints([]);
  };

  const handleSliderChange = (key: string, val: number) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-slate-950 rounded-xl overflow-hidden select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          handlePointerUp();
          setHoverCoord(null);
        }}
        className={`w-full h-full block ${isLaserEnabled ? 'cursor-crosshair' : 'cursor-default'}`}
      />

      {/* Interactive Controls Overlay Toggle */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Magic Laser Pointer Toggle */}
        <button
          onClick={() => {
            setIsLaserEnabled(!isLaserEnabled);
            if (!isLaserEnabled) setLaserPoints([]);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isLaserEnabled
              ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 font-bold'
              : 'bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700/60'
          }`}
          title="Puntero Láser Dinámico: Dibuja trazos brillantes sobre la simulación en vivo"
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>{isLaserEnabled ? 'Láser Activo' : 'Puntero Láser'}</span>
        </button>

        {interactiveSliders && interactiveSliders.length > 0 && (
          <>
            <button
              onClick={() => setShowSliders(!showSliders)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showSliders
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/80 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700/60'
              }`}
              title="Ajustar parámetros físicos y matemáticos en tiempo real"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showSliders ? 'Ocultar Parámetros' : 'Sandbox'}</span>
            </button>

            {(showSliders || laserPoints.length > 0) && (
              <button
                onClick={handleResetParams}
                className="p-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
                title="Restablecer valores iniciales y limpiar trazos"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Telemetry Inspector Badge on Hover */}
      {hoverCoord && (
        <div className="absolute bottom-2 left-4 z-20 pointer-events-none flex items-center gap-2 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>X: {hoverCoord.normX}</span>
          <span>Y: {hoverCoord.normY}</span>
          {isLaserEnabled && <span className="text-amber-400 font-semibold">· Modo Pizarra</span>}
        </div>
      )}

      {/* Floating Interactive Sliders Drawer */}
      {showSliders && interactiveSliders.length > 0 && (
        <div className="absolute top-14 right-4 z-20 w-72 p-4 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-xl shadow-2xl text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-semibold text-slate-200">Variables en Vivo</span>
            <span className="text-[11px] text-cyan-400 font-mono">Modo Sandbox</span>
          </div>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {interactiveSliders.map((slider) => {
              const currentValue = params[slider.paramKey] ?? slider.defaultValue;
              return (
                <div key={slider.paramKey} className="space-y-1">
                  <div className="flex justify-between items-center text-slate-300">
                    <label className="text-[11px]">{slider.label}</label>
                    <span className="font-mono text-cyan-300 font-medium">
                      {typeof currentValue === 'number' ? currentValue.toFixed(slider.step < 0.1 ? 2 : 1) : currentValue}{' '}
                      <span className="text-slate-500">{slider.unit}</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={currentValue}
                    onChange={(e) => handleSliderChange(slider.paramKey, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>{slider.min}</span>
                    <span>{slider.max}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
