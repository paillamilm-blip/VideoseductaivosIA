import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VideoProject, Scene, VideoFormat } from '../types/stem';
import { SimulationCanvas } from './simulations/SimulationCanvas';
import { MathFormula } from './MathFormula';
import { audioService } from '../utils/audioSynthesis';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
  HelpCircle,
  Subtitles,
  Smartphone,
  Tv,
  Zap,
} from 'lucide-react';

interface VideoPlayerProps {
  project: VideoProject;
  currentSceneIndex: number;
  onSceneChange: (index: number) => void;
  onOpenQuiz?: (scene: Scene) => void;
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
  format?: VideoFormat;
  onChangeFormat?: (format: VideoFormat) => void;
  isViralCaptionsActive?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  project,
  currentSceneIndex,
  onSceneChange,
  onOpenQuiz,
  onCanvasReady,
  format = '16:9',
  onChangeFormat,
  isViralCaptionsActive = true,
}) => {
  const currentScene = project.scenes[currentSceneIndex] || project.scenes[0];
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sceneTime, setSceneTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(format === '9:16' ? 1.15 : 1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [activeSpokenWord, setActiveSpokenWord] = useState<string>('');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneTimerRef = useRef<any>(null);

  // Total duration
  const totalDuration = project.scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

  // Global elapsed time
  const globalElapsedTime =
    project.scenes.slice(0, currentSceneIndex).reduce((acc, s) => acc + s.durationSeconds, 0) +
    sceneTime;

  // Handle scene voiceover narration with viral sound effects
  const triggerNarrationForCurrentScene = useCallback(() => {
    if (isMuted) return;

    // Trigger viral SFX cue for this scene
    if (currentScene.soundEffectCue && currentScene.soundEffectCue !== 'none') {
      audioService.playViralCue(currentScene.soundEffectCue);
    } else {
      audioService.playSceneTransitionSound();
    }

    audioService.speakNarration(
      currentScene.narration,
      'es',
      playbackRate,
      (_charIdx, word) => {
        setActiveSpokenWord(word);
      },
      () => {
        setActiveSpokenWord('');
      }
    );
  }, [currentScene, isMuted, playbackRate]);

  // Scene transition
  const goToScene = useCallback(
    (index: number) => {
      audioService.stopNarration();
      const clampedIndex = Math.max(0, Math.min(project.scenes.length - 1, index));
      onSceneChange(clampedIndex);
      setSceneTime(0);
      setActiveSpokenWord('');
    },
    [project.scenes.length, onSceneChange]
  );

  // Toggle Play / Pause
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioService.stopNarration();
    } else {
      setIsPlaying(true);
      triggerNarrationForCurrentScene();
    }
  };

  // Main playback tick timer
  useEffect(() => {
    if (!isPlaying) {
      if (sceneTimerRef.current) clearInterval(sceneTimerRef.current);
      return;
    }

    const intervalMs = 50;
    sceneTimerRef.current = setInterval(() => {
      setSceneTime((prev) => {
        const next = prev + (intervalMs / 1000) * playbackRate;
        if (next >= currentScene.durationSeconds) {
          if (currentSceneIndex < project.scenes.length - 1) {
            goToScene(currentSceneIndex + 1);
            return 0;
          } else {
            setIsPlaying(false);
            audioService.stopNarration();
            return currentScene.durationSeconds;
          }
        }
        return next;
      });
    }, intervalMs);

    return () => {
      if (sceneTimerRef.current) clearInterval(sceneTimerRef.current);
    };
  }, [isPlaying, playbackRate, currentScene.durationSeconds, currentSceneIndex, project.scenes.length, goToScene]);

  // When currentScene changes while playing, start narration
  useEffect(() => {
    if (isPlaying) {
      triggerNarrationForCurrentScene();
    }
  }, [currentSceneIndex, triggerNarrationForCurrentScene, isPlaying]);

  // Restart video
  const handleRestart = () => {
    goToScene(0);
    setSceneTime(0);
    if (isPlaying) {
      triggerNarrationForCurrentScene();
    }
  };

  // Fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.warn(err));
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Aspect ratio wrapper styles
  const getViewportDimensions = () => {
    switch (format) {
      case '9:16':
        return 'max-w-[360px] aspect-[9/16] min-h-[580px] shadow-2xl rounded-3xl border-4 border-slate-800';
      case '1:1':
        return 'max-w-[540px] aspect-square min-h-[460px] shadow-2xl rounded-2xl border border-slate-800';
      case '16:9':
      default:
        return 'w-full aspect-video min-h-[400px] lg:min-h-[480px] shadow-2xl rounded-2xl border border-slate-800';
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center bg-slate-950 rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden p-2 sm:p-4"
    >
      {/* Video Viewport / Stage Container */}
      <div className={`relative w-full flex items-center justify-center bg-slate-950 my-2`}>
        <div
          className={`relative overflow-hidden bg-slate-950 flex items-center justify-center transition-all duration-300 ${getViewportDimensions()}`}
        >
          {/* Dynamic Canvas Simulation */}
          <SimulationCanvas
            visualType={currentScene.visualType}
            currentTime={sceneTime}
            isPlaying={isPlaying}
            baseParameters={currentScene.parameters}
            interactiveSliders={currentScene.interactiveSliders}
            onCanvasRef={onCanvasReady}
            className="w-full h-full"
          />

          {/* Top Info Banner Overlay */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 max-w-[85%] pointer-events-none">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-cyan-300 bg-slate-950/85 backdrop-blur-md px-2 py-0.5 rounded border border-cyan-500/40">
                {currentScene.pedagogicalPhase}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-300 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded border border-slate-800">
                {currentScene.title}
              </span>
            </div>

            {/* Key Formula Badge in KaTeX */}
            {currentScene.equations && currentScene.equations.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/90 backdrop-blur-md rounded-lg border border-slate-800 shadow-lg text-xs w-fit">
                <MathFormula formula={currentScene.equations[0]} />
              </div>
            )}
          </div>

          {/* Quiz Prompt Button if Scene has a Quiz */}
          {currentScene.quizQuestion && onOpenQuiz && (
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  audioService.stopNarration();
                  onOpenQuiz(currentScene);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-lg transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desafío</span>
              </button>
            </div>
          )}

          {/* Subtitles Overlay Bar: Classic vs Viral TikTok Style */}
          {showSubtitles && currentScene.narration && (
            <div
              className={`absolute left-4 right-4 z-10 flex justify-center pointer-events-none transition-all ${
                format === '9:16' ? 'bottom-16' : 'bottom-6'
              }`}
            >
              {isViralCaptionsActive ? (
                /* Viral TikTok / Shorts Bold Subtitles with Highlight */
                <div className="max-w-xl px-4 py-2 bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 rounded-2xl shadow-2xl text-center">
                  <p className="text-sm sm:text-base font-extrabold uppercase tracking-wide leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {currentScene.narration.split(' ').map((w, i) => {
                      const cleanWord = w.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').toLowerCase();
                      const cleanActive = activeSpokenWord.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '').toLowerCase();
                      const isCurrentWord = cleanActive && cleanWord && (cleanWord.includes(cleanActive) || cleanActive.includes(cleanWord));
                      const isViralKey =
                        currentScene.viralKeyword &&
                        w.toUpperCase().includes(currentScene.viralKeyword.toUpperCase());

                      let colorClass = 'text-white';
                      if (isCurrentWord) {
                        colorClass = 'text-amber-300 scale-110 underline decoration-amber-400 decoration-2';
                      } else if (isViralKey) {
                        colorClass = 'text-cyan-300 font-black';
                      }

                      return (
                        <span key={i} className={`inline-block mr-1.5 transition-all ${colorClass}`}>
                          {w}
                        </span>
                      );
                    })}
                  </p>
                </div>
              ) : (
                /* Classic Minimal Subtitles */
                <div className="max-w-2xl px-4 py-2.5 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-xl shadow-xl text-center">
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium">
                    {currentScene.narration}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Timeline & Player Control Deck */}
      <div className="w-full max-w-4xl p-4 bg-slate-900/95 border border-slate-800 rounded-2xl flex flex-col gap-3">
        {/* Timeline Progress Bar with Scene Markers */}
        <div className="relative w-full">
          <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden cursor-pointer group">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400 transition-all duration-75"
              style={{
                width: `${(globalElapsedTime / (totalDuration || 1)) * 100}%`,
              }}
            />
          </div>

          <div className="absolute top-0 left-0 right-0 h-2 flex pointer-events-none">
            {project.scenes.map((s, idx) => {
              const fraction = s.durationSeconds / (totalDuration || 1);
              return (
                <div
                  key={idx}
                  style={{ width: `${fraction * 100}%` }}
                  className={`relative border-r border-slate-950/80 ${
                    idx === currentSceneIndex ? 'ring-1 ring-cyan-400/50' : ''
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Controller Buttons Row */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Playback Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goToScene(currentSceneIndex - 1)}
              disabled={currentSceneIndex === 0}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Escena Anterior"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handleTogglePlay}
              className="p-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold transition-transform active:scale-95 shadow-md shadow-cyan-400/20"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={() => goToScene(currentSceneIndex + 1)}
              disabled={currentSceneIndex === project.scenes.length - 1}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Siguiente Escena"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={handleRestart}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reiniciar"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Time Indicator */}
            <div className="text-xs font-mono text-slate-400 ml-1">
              <span className="text-slate-100 font-semibold">{formatTime(globalElapsedTime)}</span> /{' '}
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Center: Quick Format Toggles */}
          {onChangeFormat && (
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                onClick={() => onChangeFormat('9:16')}
                className={`p-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                  format === '9:16' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Modo Vertical 9:16 (TikTok/Reels/Shorts)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[10px]">9:16</span>
              </button>
              <button
                onClick={() => onChangeFormat('16:9')}
                className={`p-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                  format === '16:9' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Modo Panorámico 16:9 (YouTube)"
              >
                <Tv className="w-3.5 h-3.5" />
                <span className="text-[10px]">16:9</span>
              </button>
            </div>
          )}

          {/* Right: Audio, Speed & Display Utilities */}
          <div className="flex items-center gap-1.5">
            {/* Speed Selector */}
            <select
              value={playbackRate}
              onChange={(e) => {
                const newRate = parseFloat(e.target.value);
                setPlaybackRate(newRate);
                if (isPlaying) {
                  audioService.stopNarration();
                  triggerNarrationForCurrentScene();
                }
              }}
              className="bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono cursor-pointer hover:border-slate-600 transition-colors"
            >
              <option value="0.75">0.75x</option>
              <option value="1.0">1.0x</option>
              <option value="1.15">1.15x (Viral)</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
            </select>

            {/* Subtitles Toggle */}
            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`p-2 rounded-lg transition-colors ${
                showSubtitles ? 'text-cyan-400 bg-slate-800' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Subtítulos"
            >
              <Subtitles className="w-4 h-4" />
            </button>

            {/* Mute Narration Toggle */}
            <button
              onClick={() => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                if (nextMuted) audioService.stopNarration();
                else if (isPlaying) triggerNarrationForCurrentScene();
              }}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'text-rose-400 bg-slate-800' : 'text-slate-400 hover:text-white'
              }`}
              title={isMuted ? 'Activar Voz' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Pantalla Completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
