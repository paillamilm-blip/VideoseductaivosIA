import React, { useState } from 'react';
import { Scene } from '../types/stem';
import { HelpCircle, CheckCircle2, XCircle, X, ArrowRight, Lightbulb } from 'lucide-react';

interface InteractiveQuizModalProps {
  scene: Scene;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const InteractiveQuizModal: React.FC<InteractiveQuizModalProps> = ({
  scene,
  isOpen,
  onClose,
  onComplete,
}) => {
  const quiz = scene.quizQuestion;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen || !quiz) return null;

  const isCorrect = selectedIndex === quiz.correctIndex;

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSelectedIndex(null);
    setSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                Desafío Conceptual · Escena {scene.sceneNumber}
              </span>
              <h3 className="text-sm font-bold text-slate-100">{scene.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Question & Options */}
        <div className="p-6 space-y-5">
          <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
            {quiz.question}
          </p>

          <div className="space-y-2.5">
            {quiz.options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              let btnStyle = 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700';

              if (submitted) {
                if (idx === quiz.correctIndex) {
                  btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-200';
                } else {
                  btnStyle = 'opacity-40 border-slate-850';
                }
              } else if (isSelected) {
                btnStyle = 'bg-cyan-950/50 border-cyan-500 text-cyan-200 shadow-sm';
              }

              return (
                <button
                  key={idx}
                  disabled={submitted}
                  onClick={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs sm:text-sm flex items-start gap-3 ${btnStyle}`}
                >
                  <span className="font-mono font-bold text-xs mt-0.5 text-slate-500">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                  {submitted && idx === quiz.correctIndex && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {submitted && isSelected && idx !== quiz.correctIndex && (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {submitted && (
            <div
              className={`p-4 rounded-xl border space-y-1.5 animate-in fade-in duration-200 ${
                isCorrect
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                  : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{isCorrect ? '¡Correcto! Excelente razonamiento físico' : 'Explicación Pedagógica:'}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{quiz.explanation}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {submitted ? (isCorrect ? 'Desafío superado' : 'Revisa el razonamiento') : 'Selecciona una respuesta'}
            </span>

            <div className="flex items-center gap-2">
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedIndex === null}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors disabled:opacity-40"
                >
                  Verificar Respuesta
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    if (onComplete) onComplete();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors"
                >
                  <span>Continuar Video</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
