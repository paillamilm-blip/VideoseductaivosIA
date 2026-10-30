import React, { useState } from 'react';
import { VideoProject, VideoFormat, ViralSoundEffect } from '../types/stem';
import { audioService, CanvasTheme } from '../utils/audioSynthesis';
import { ViralDebateSimulator } from './ViralDebateSimulator';
import {
  Flame,
  Smartphone,
  Tv,
  Square,
  Copy,
  Check,
  Zap,
  Volume2,
  TrendingUp,
  Hash,
  Lightbulb,
  Music,
  Palette,
} from 'lucide-react';

interface ViralToolkitProps {
  project: VideoProject;
  activeFormat: VideoFormat;
  onChangeFormat: (format: VideoFormat) => void;
  isViralCaptionsActive: boolean;
  onToggleViralCaptions: () => void;
  onApplyTitle: (title: string) => void;
  currentTheme?: CanvasTheme;
  onChangeTheme?: (theme: CanvasTheme) => void;
}

export const ViralToolkit: React.FC<ViralToolkitProps> = ({
  project,
  activeFormat,
  onChangeFormat,
  isViralCaptionsActive,
  onToggleViralCaptions,
  onApplyTitle,
  currentTheme = '3blue1brown',
  onChangeTheme,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isMusicActive, setIsMusicActive] = useState<boolean>(audioService.isSoundtrackActive());

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleTestSFX = (cue: ViralSoundEffect) => {
    audioService.playViralCue(cue);
  };

  const handleToggleMusic = () => {
    if (isMusicActive) {
      audioService.stopAmbientSoundtrack();
      setIsMusicActive(false);
    } else {
      audioService.startAmbientSoundtrack(0.04);
      setIsMusicActive(true);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner Control Deck */}
      <div className="flex flex-col gap-5 p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-400">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Viral Studio Toolkit</span>
                <span className="text-[10px] font-mono font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                  TikTok · Shorts · Reels
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Optimizador de retención de audiencia, ganchos de 3 segundos y títulos de alto CTR
              </p>
            </div>
          </div>

          {/* Video Aspect Ratio Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => onChangeFormat('9:16')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFormat === '9:16'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Formato vertical para TikTok, Instagram Reels y YouTube Shorts"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 Shorts</span>
            </button>

            <button
              onClick={() => onChangeFormat('16:9')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFormat === '16:9'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Formato horizontal panorámico para YouTube y escritorio"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>16:9 Cinema</span>
            </button>

            <button
              onClick={() => onChangeFormat('1:1')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeFormat === '1:1'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Formato cuadrado para Instagram Feed y LinkedIn"
            >
              <Square className="w-3.5 h-3.5" />
              <span>1:1 Cuadrado</span>
            </button>
          </div>
        </div>

        {/* Grid: High-CTR Titles & Viral Captions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Viral Titles with Estimated CTR */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>Títulos Virales con Alto CTR (Click-Through Rate)</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Haz clic para aplicar</span>
            </div>

            <div className="space-y-2">
              {project.viralTitles && project.viralTitles.length > 0 ? (
                project.viralTitles.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 rounded-xl transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider font-mono">
                          {item.hookType}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-800/40">
                          {item.estimatedCTR}% CTR est.
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 truncate group-hover:text-amber-200 transition-colors">
                        {item.title}
                      </p>
                    </div>

                    <button
                      onClick={() => onApplyTitle(item.title)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-all shrink-0"
                    >
                      Usar Título
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Genera un nuevo video para obtener variantes con CTR.</p>
              )}
            </div>

            {/* Retention Tip Box */}
            {project.retentionTip && (
              <div className="p-3.5 bg-amber-950/20 border border-amber-800/40 rounded-xl flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider font-mono">
                    Consejo de Retención de Audiencia:
                  </span>
                  <p className="text-xs text-amber-100/90 leading-relaxed">{project.retentionTip}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Audio, Themes & Hashtags */}
          <div className="lg:col-span-5 space-y-4">
            {/* Innovation: Algorithmic Ambient Synth Soundtrack Toggle */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Banda Sonora Lo-Fi STEM (Sin Copyright)</span>
                </span>
                <button
                  onClick={handleToggleMusic}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isMusicActive
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {isMusicActive ? 'Música ON' : 'Activar Música'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sintetizador algorítmico pentatónico en tiempo real (*Web Audio API*). Genera una atmósfera hipnótica tipo
                3Blue1Brown/Veritasium 100% libre de reclamos de derechos de autor.
              </p>
            </div>

            {/* Subtitles Style Switch */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Subtítulos Virales (TikTok / MrBeast)</span>
                </span>
                <button
                  onClick={onToggleViralCaptions}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    isViralCaptionsActive ? 'bg-amber-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                      isViralCaptionsActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Resalta palabras clave dinámicamente con tipografía bold de alto impacto para maximizar la lectura rápida.
              </p>
            </div>

            {/* Viral Audio Soundboard */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Efectos de Sonido Virales</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleTestSFX('whoosh')}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-mono transition-colors"
                >
                  💨 Whoosh
                </button>
                <button
                  onClick={() => handleTestSFX('impact_bass')}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-mono transition-colors"
                >
                  💥 Bass Boom
                </button>
                <button
                  onClick={() => handleTestSFX('pop')}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-mono transition-colors"
                >
                  🫧 Pop
                </button>
                <button
                  onClick={() => handleTestSFX('tension_riser')}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-mono transition-colors"
                >
                  📈 Tensión
                </button>
              </div>
            </div>

            {/* Hashtags & Description Copy */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hashtags & Descripción Viral</span>
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${project.title}\n\n${project.hook}\n\n${(project.viralHashtags || []).join(' ')}`,
                      'hashtags'
                    )
                  }
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                >
                  {copiedSection === 'hashtags' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copiar Copy
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex flex-wrap gap-1.5">
                {(project.viralHashtags || ['#FisicaViral', '#AprendeEnTikTok', '#STEM']).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-cyan-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Innovation: Viral Debate & Comment Section Multiplier */}
      <ViralDebateSimulator project={project} />
    </div>
  );
};
