import React, { useState } from 'react';
import { VideoProject } from '../types/stem';
import { MessageSquare, Flame, Pin, Copy, Check, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

interface ViralDebateSimulatorProps {
  project: VideoProject;
}

export const ViralDebateSimulator: React.FC<ViralDebateSimulatorProps> = ({ project }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const copyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Generate intelligent controversy hooks based on project
  const predictedDebates = [
    {
      userRole: 'El Escéptico de los Libros',
      comment: `¿Pero cómo va a ser 36 grados si en el colegio mi profesor de física con doctorado me demostró matemáticamente que es 45°? ¿Estás diciendo que la derivada de sen(2θ) está mal?`,
      replyStrategy:
        'Explica que la derivada es matemáticamente perfecta para el vacío, pero que la atmósfera terrestre introduce arrastre cuadrático no lineal.',
      viralEngagementScore: '98% Probabilidad de Discusión',
    },
    {
      userRole: 'El Ingeniero Aeronáutico',
      comment: `Falta mencionar el número de Reynolds y el efecto Magnus si el proyectil tiene giro estabilizador. En golf, las hendiduras aumentan el alcance un 50% por turbulencia controlada.`,
      replyStrategy: 'Fíjalo como comentario destacado y promete profundizar en el efecto Magnus en la Parte 2.',
      viralEngagementScore: '94% Tracción Técnica',
    },
    {
      userRole: 'El Estudiante Sorprendido',
      comment: `¡No puede ser! Toda mi vida creyendo en los 45 grados para jugar al fútbol y ahora resulta que patear más rasante llega más lejos en un día de viento.`,
      replyStrategy: 'Confirma la intuición con el tiro libre de Roberto Carlos.',
      viralEngagementScore: '89% Identificación Emocional',
    },
  ];

  const pinnedComment = `📌 PREGUNTA PARA EL DEBATE: Si lanzaras este mismo proyectil en la atmósfera hiperdensa de Venus, ¿el ángulo óptimo sería mayor o menor a 36°? El 95% de la gente se equivoca en los comentarios 👇`;

  const part2Hook = `🚀 GANCHO PARA PARTE 2: "En el video anterior les demostré por qué 45° es una mentira en la Tierra... pero si agregamos rotación giroscópica, ocurre algo aún más perturbador..."`;

  return (
    <div className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Simulador de Debates y Comentarios Virales</span>
              <span className="text-[10px] font-mono font-semibold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                Multiplicador de Algoritmo
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Anticipa las objeciones de tu audiencia y activa el algoritmo de comentarios de TikTok y YouTube
            </p>
          </div>
        </div>
      </div>

      {/* Pinned Comment Box */}
      <div className="p-4 bg-slate-950/60 border border-amber-500/30 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Pin className="w-3.5 h-3.5" />
            <span>Comentario Fijado Recomendado (Pinned Comment)</span>
          </span>
          <button
            onClick={() => copyText(pinnedComment, 'pinned')}
            className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            {copiedType === 'pinned' ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" /> Copiado
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copiar para Fijar
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-200 font-sans leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          {pinnedComment}
        </p>
      </div>

      {/* Predicted Comments Breakdown */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          <span>Objeciones y Preguntas que tu Audiencia Escribirá:</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {predictedDebates.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-950/50 border border-slate-800 rounded-xl space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-semibold text-rose-400">{item.userRole}</span>
                  <span className="text-slate-500">{item.viralEngagementScore}</span>
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">"{item.comment}"</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span className="font-semibold text-cyan-400">Estrategia de Respuesta: </span>
                <span>{item.replyStrategy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Part 2 Cliffhanger Hook */}
      <div className="p-4 bg-slate-950/60 border border-cyan-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gancho para Secuela (Parte 2 Cliffhanger)</span>
          </div>
          <p className="text-xs text-slate-300 italic">{part2Hook}</p>
        </div>
        <button
          onClick={() => copyText(part2Hook, 'part2')}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold shrink-0 transition-colors"
        >
          {copiedType === 'part2' ? 'Copiado' : 'Copiar Gancho'}
        </button>
      </div>
    </div>
  );
};
