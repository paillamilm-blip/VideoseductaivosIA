import React, { useState } from 'react';
import { VideoProject, Scene } from '../types/stem';
import { MathFormula } from './MathFormula';
import {
  FileText,
  Sparkles,
  Edit3,
  Check,
  RotateCcw,
  BookOpen,
  Eye,
  Mic,
  Copy,
  ChevronRight,
} from 'lucide-react';

interface ScriptEditorProps {
  project: VideoProject;
  activeSceneIndex: number;
  onSelectScene: (idx: number) => void;
  onUpdateScene: (sceneIndex: number, updatedScene: Scene) => void;
  onRegenerateScenePrompt?: (sceneIndex: number, customPrompt: string) => Promise<void>;
  isRegeneratingScene?: boolean;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  project,
  activeSceneIndex,
  onSelectScene,
  onUpdateScene,
  onRegenerateScenePrompt,
  isRegeneratingScene = false,
}) => {
  const currentScene = project.scenes[activeSceneIndex] || project.scenes[0];
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedNarration, setEditedNarration] = useState<string>(currentScene.narration);
  const [editedSpeakerNotes, setEditedSpeakerNotes] = useState<string>(currentScene.speakerNotes);
  const [regeneratePrompt, setRegeneratePrompt] = useState<string>('');
  const [showRegenBox, setShowRegenBox] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync state when active scene changes
  React.useEffect(() => {
    setEditedNarration(currentScene.narration);
    setEditedSpeakerNotes(currentScene.speakerNotes);
    setIsEditing(false);
    setShowRegenBox(false);
  }, [currentScene]);

  const handleSaveEdits = () => {
    onUpdateScene(activeSceneIndex, {
      ...currentScene,
      narration: editedNarration,
      speakerNotes: editedSpeakerNotes,
    });
    setIsEditing(false);
  };

  const handleCopyFullScript = () => {
    const fullText = project.scenes
      .map(
        (s) =>
          `=== ESCENA ${s.sceneNumber}: ${s.title.toUpperCase()} (${s.pedagogicalPhase}) ===\n` +
          `[Duración: ${s.durationSeconds}s]\n` +
          `[Locución en Off]:\n${s.narration}\n\n` +
          `[Notas del Locutor]: ${s.speakerNotes}\n` +
          `[Indicaciones Visuales]: ${s.visualCues}\n` +
          `[Fórmulas]: ${s.equations.join(' | ')}\n` +
          `[Conclusión]: ${s.takeawayPoint}\n`
      )
      .join('\n\n');

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerRegen = async () => {
    if (!onRegenerateScenePrompt) return;
    await onRegenerateScenePrompt(activeSceneIndex, regeneratePrompt);
    setShowRegenBox(false);
    setRegeneratePrompt('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden">
      {/* Script Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h3 className="font-semibold text-slate-100 text-sm">Guión Detallado & Storyboard</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyFullScript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            title="Copiar guión completo con marcas de tiempo"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado' : 'Copiar Guión'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Split: Scenes List on Left, Active Scene Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
        {/* Scenes Index Sidebar */}
        <div className="lg:col-span-4 border-r border-slate-800/80 bg-slate-950/40 p-3 overflow-y-auto space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
            Estructura Pedagógica ({project.scenes.length} Escenas)
          </span>

          <div className="space-y-1.5">
            {project.scenes.map((scene, idx) => {
              const isActive = idx === activeSceneIndex;
              return (
                <button
                  key={scene.sceneNumber}
                  onClick={() => onSelectScene(idx)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isActive
                      ? 'bg-slate-800/90 border-cyan-500/40 shadow-lg shadow-cyan-950/30'
                      : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {scene.pedagogicalPhase}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{scene.durationSeconds}s</span>
                  </div>
                  <h4 className={`text-xs font-medium truncate ${isActive ? 'text-slate-100 font-semibold' : 'text-slate-300'}`}>
                    {idx + 1}. {scene.title}
                  </h4>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Scene Detailed Card */}
        <div className="lg:col-span-8 p-5 overflow-y-auto space-y-5 bg-slate-950/20">
          {/* Scene Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-cyan-400">
                  Escena {currentScene.sceneNumber} · {currentScene.pedagogicalPhase}
                </span>
                <span className="text-xs text-slate-500 font-mono">({currentScene.durationSeconds} segundos)</span>
              </div>
              <h2 className="text-base font-bold text-slate-100">{currentScene.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{currentScene.visualConcept}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRegenBox(!showRegenBox)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-950/40 hover:bg-cyan-950/70 text-cyan-300 border border-cyan-800/50 transition-colors"
                title="Ajustar esta escena con Inteligencia Artificial"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mejorar con IA</span>
              </button>

              {isEditing ? (
                <button
                  onClick={handleSaveEdits}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              )}
            </div>
          </div>

          {/* AI Prompt Box if Opened */}
          {showRegenBox && (
            <div className="p-4 bg-slate-900 border border-cyan-500/30 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">Reescribir Escena con Gemini</span>
              </div>
              <input
                type="text"
                placeholder="Ej: Haz la explicación más intuitiva para principiantes, o profundiza en la formulación matemática..."
                value={regeneratePrompt}
                onChange={(e) => setRegeneratePrompt(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRegenBox(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleTriggerRegen}
                  disabled={isRegeneratingScene}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
                >
                  {isRegeneratingScene ? 'Regenerando...' : 'Aplicar Mejora'}
                </button>
              </div>
            </div>
          )}

          {/* Narration Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Mic className="w-4 h-4 text-cyan-400" />
              <span>Locución en Off (Narration)</span>
            </div>

            {isEditing ? (
              <textarea
                value={editedNarration}
                onChange={(e) => setEditedNarration(e.target.value)}
                rows={4}
                className="w-full bg-slate-900 text-slate-100 text-xs sm:text-sm p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500 leading-relaxed"
              />
            ) : (
              <div className="p-4 bg-slate-900/70 border border-slate-800/80 rounded-xl">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  {currentScene.narration}
                </p>
              </div>
            )}
          </div>

          {/* Mathematical Equations Card */}
          {currentScene.equations && currentScene.equations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Ecuaciones Matemáticas en Pantalla</span>
              </div>
              <div className="flex flex-wrap gap-3 p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                {currentScene.equations.map((eq, i) => (
                  <div key={i} className="px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg">
                    <MathFormula formula={eq} displayMode={true} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speaker Notes & Visual Cues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Speaker Notes */}
            <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <Mic className="w-3.5 h-3.5" />
                <span>Notas de Dirección & Entonación</span>
              </div>
              {isEditing ? (
                <textarea
                  value={editedSpeakerNotes}
                  onChange={(e) => setEditedSpeakerNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 text-slate-200 text-xs p-2 rounded-lg border border-slate-700"
                />
              ) : (
                <p className="text-xs text-slate-400 leading-relaxed">
                  {currentScene.speakerNotes || 'Mantener tono pedagógico y pausado.'}
                </p>
              )}
            </div>

            {/* Visual Cues */}
            <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                <Eye className="w-3.5 h-3.5" />
                <span>Indicaciones Visuales de Cámara</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {currentScene.visualCues || 'Sincronizar el trazado de la simulación con la locución.'}
              </p>
            </div>
          </div>

          {/* Scene Key Takeaway */}
          <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl flex items-center gap-3">
            <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider shrink-0">
              Conclusión Clave:
            </span>
            <p className="text-xs text-cyan-200">{currentScene.takeawayPoint}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
