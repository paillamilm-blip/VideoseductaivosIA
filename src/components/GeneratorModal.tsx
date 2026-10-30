import React, { useState } from 'react';
import { SubjectArea, VideoFormat } from '../types/stem';
import { Sparkles, X, Wand2, Lightbulb, Loader2, Flame, Smartphone, Tv } from 'lucide-react';

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (params: {
    topic: string;
    subject: SubjectArea;
    audience: string;
    tone: string;
    duration: string;
    language: string;
    customInstructions: string;
  }) => Promise<void>;
  isGenerating: boolean;
}

const VIRAL_TOPIC_PRESETS = [
  {
    subject: 'Física' as SubjectArea,
    topic: 'La Gran Mentira del Ángulo de 45° en la Escuela',
    desc: 'Por qué en el aire real 45° es el peor ángulo y ningún cañón militar lo usa.',
  },
  {
    subject: 'Matemáticas' as SubjectArea,
    topic: 'El Algoritmo Oculto que Salva a Todo Internet (Fourier)',
    desc: 'Cómo círculos girando en el plano complejo hacen posible Shazam, Spotify y el 5G.',
  },
  {
    subject: 'Ingeniería' as SubjectArea,
    topic: 'Por qué NUNCA se usan vigas cuadradas en puentes y rascacielos',
    desc: 'El secreto del perfil en I que ahorra billones de dólares en acero estructural.',
  },
  {
    subject: 'Física' as SubjectArea,
    topic: 'El Experimento que Demuestra que la Realidad Cambia al Observarla',
    desc: 'La paradoja cuántica de la doble rendija y el colapso de la función de onda.',
  },
  {
    subject: 'Ingeniería' as SubjectArea,
    topic: 'El Resonador Oculto en tu Teléfono que Filtra Millones de Ondas',
    desc: 'Circuitos RLC y cómo tu celular sintoniza una emisora específica sin cables.',
  },
  {
    subject: 'Matemáticas' as SubjectArea,
    topic: '¿Cómo sumar infinitos rectángulos sin que el área sea infinita?',
    desc: 'La paradoja de Riemann y el truco visual detrás de todo el cálculo integral.',
  },
];

export const GeneratorModal: React.FC<GeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
}) => {
  const [topic, setTopic] = useState('La Gran Mentira del Ángulo de 45° en la Escuela');
  const [subject, setSubject] = useState<SubjectArea>('Física');
  const [audience, setAudience] = useState('Viral / Todos los Públicos');
  const [tone, setTone] = useState('Viral, Rápido y Provocador (estilo Veritasium & TikTok)');
  const [duration, setDuration] = useState('60 segundos (Shorts / Reels)');
  const [language, setLanguage] = useState('es');
  const [customInstructions, setCustomInstructions] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onGenerate({
      topic,
      subject,
      audience,
      tone,
      duration,
      language,
      customInstructions,
    });
  };

  const handleSelectPreset = (preset: (typeof VIRAL_TOPIC_PRESETS)[0]) => {
    setTopic(preset.topic);
    setSubject(preset.subject);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-amber-400">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Generar Video Viral STEM con IA</span>
                <span className="text-[10px] font-mono font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                  Alta Retención
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gemini generará ganchos irresistibles, efectos de sonido y simulaciones dinámicas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Topic Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>Tema, Paradoja o Pregunta Provocadora</span>
              <span className="text-[11px] text-amber-400 font-normal">Gancho en los primeros 3s</span>
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: Por qué la física mintió sobre los 45 grados, el teorema más destructivo..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick Preset Topics */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Plantillas de alto impacto viral garantizado:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VIRAL_TOPIC_PRESETS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                    topic === p.topic
                      ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold text-slate-200 truncate">{p.topic}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Subject Area */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Disciplina</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as SubjectArea)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-700/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="Física">Física</option>
                <option value="Matemáticas">Matemáticas</option>
                <option value="Ingeniería">Ingeniería</option>
              </select>
            </div>

            {/* Audience */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Público Objetivo</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-700/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="Viral / Todos los Públicos">Viral (TikTok, Shorts, Reels)</option>
                <option value="Estudiantes de Secundaria / Bachillerato">Secundaria / Bachillerato</option>
                <option value="Universidad / Grado en STEM">Universidad / Grado</option>
                <option value="Ingenieros Profesionales">Ingenieros Profesionales</option>
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Duración Óptima</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-700/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="60 segundos (Shorts / Reels)">60s (Viral Shorts / Reels)</option>
                <option value="90 segundos">90s (Microclase Intensa)</option>
                <option value="3 minutos">3 min (Estándar YouTube)</option>
                <option value="5 minutos">5 min (In-Depth Documental)</option>
              </select>
            </div>
          </div>

          {/* Tone & Language Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tone */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Tono y Narrativa</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-700/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="Viral, Rápido y Provocador (estilo Veritasium & TikTok)">
                  Viral & Provocador (Veritasium / TikTok)
                </option>
                <option value="Intuitivo y Riguroso (estilo 3Blue1Brown)">
                  Intuitivo y Elegante (3Blue1Brown)
                </option>
                <option value="Épico y Existencial (estilo Kurzgesagt)">
                  Épico y Existencial (Kurzgesagt)
                </option>
                <option value="Ingeniería y Construcción Real (estilo Mark Rober)">
                  Práctico e Inventiva (Mark Rober)
                </option>
              </select>
            </div>

            {/* Language */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">Idioma</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-700/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300">
              Instrucciones Especiales para la IA (Opcional)
            </label>
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Ej: Empieza con una pregunta impactante sobre la NASA, enfatiza el sonido de impacto..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">Motor: Gemini 3.8 Flash Viral STEM</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Optimizando Viralidad...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Automatizar Video Viral</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
