import React, { useState } from 'react';
import { VideoProject, Scene, SubjectArea, VideoFormat } from './types/stem';
import { SHOWCASE_PROJECTS } from './data/showcaseProjects';
import { VideoPlayer } from './components/VideoPlayer';
import { ScriptEditor } from './components/ScriptEditor';
import { ViralToolkit } from './components/ViralToolkit';
import { GeneratorModal } from './components/GeneratorModal';
import { InteractiveQuizModal } from './components/InteractiveQuizModal';
import { ExportModal } from './components/ExportModal';
import { MathFormula } from './components/MathFormula';
import {
  Sparkles,
  Download,
  BookOpen,
  Compass,
  CheckCircle,
  Smartphone,
  Tv,
  Flame,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function App() {
  const [currentProject, setCurrentProject] = useState<VideoProject>(SHOWCASE_PROJECTS[0]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'viral' | 'script' | 'objectives' | 'catalog'>('viral');
  const [videoFormat, setVideoFormat] = useState<VideoFormat>('16:9');
  const [isViralCaptionsActive, setIsViralCaptionsActive] = useState<boolean>(true);

  // Modals state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [activeQuizScene, setActiveQuizScene] = useState<Scene | null>(null);

  // Loading states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRegeneratingScene, setIsRegeneratingScene] = useState<boolean>(false);
  const [activeCanvas, setActiveCanvas] = useState<HTMLCanvasElement | null>(null);

  // Handle generating a new video project via Gemini server-side API
  const handleGenerateVideo = async (params: {
    topic: string;
    subject: SubjectArea;
    audience: string;
    tone: string;
    duration: string;
    language: string;
    customInstructions: string;
  }) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar video');
      }

      const data = await response.json();
      if (data.project) {
        setCurrentProject(data.project);
        setCurrentSceneIndex(0);
        setIsGeneratorOpen(false);
        setActiveTab('viral');
      }
    } catch (err: any) {
      console.error('Error generating video project:', err);
      alert(err.message || 'No se pudo conectar con el motor de IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle regenerating an individual scene with AI
  const handleRegenerateScenePrompt = async (sceneIndex: number, promptText: string) => {
    setIsRegeneratingScene(true);
    try {
      const currentScene = currentProject.scenes[sceneIndex];
      const response = await fetch('/api/regenerate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScene,
          videoTopic: currentProject.title,
          enhancementPrompt: promptText,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar escena con IA');
      }

      const data = await response.json();
      if (data.scene) {
        const updatedScenes = [...currentProject.scenes];
        updatedScenes[sceneIndex] = data.scene;
        setCurrentProject({
          ...currentProject,
          scenes: updatedScenes,
        });
      }
    } catch (err: any) {
      console.error('Error regenerating scene:', err);
      alert(err.message || 'Error al regenerar escena');
    } finally {
      setIsRegeneratingScene(false);
    }
  };

  // Update scene from manual edits in ScriptEditor
  const handleUpdateScene = (index: number, updatedScene: Scene) => {
    const updatedScenes = [...currentProject.scenes];
    updatedScenes[index] = updatedScene;
    setCurrentProject({
      ...currentProject,
      scenes: updatedScenes,
    });
  };

  // Switch showcase project
  const handleSelectShowcase = (proj: VideoProject) => {
    setCurrentProject(proj);
    setCurrentSceneIndex(0);
  };

  const handleApplyTitle = (newTitle: string) => {
    setCurrentProject((prev) => ({ ...prev, title: newTitle }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar following Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        {/* Zone 1: Brand Wordmark (single text element) */}
        <a href="/" className="text-lg font-extrabold tracking-tight text-slate-100 whitespace-nowrap shrink-0 flex items-center gap-1.5">
          <span>SciMotion</span>
          <span className="text-amber-400">Viral</span>
        </a>

        {/* Zone 2: 4-5 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <button
            onClick={() => {
              handleSelectShowcase(SHOWCASE_PROJECTS[0]);
              setActiveTab('viral');
            }}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Física
          </button>
          <button
            onClick={() => {
              handleSelectShowcase(SHOWCASE_PROJECTS[1]);
              setActiveTab('viral');
            }}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Matemáticas
          </button>
          <button
            onClick={() => {
              handleSelectShowcase(SHOWCASE_PROJECTS[2]);
              setActiveTab('viral');
            }}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Ingeniería
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            Catálogo
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsExportOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Video</span>
          </button>

          <button
            onClick={() => setIsGeneratorOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 rounded-lg shadow-sm shadow-amber-500/20 transition-all active:scale-95 whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>Crear Video Viral con IA</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Project Header Banner with Unboxed Metadata */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-800/60">
          <div className="space-y-1.5 max-w-3xl">
            {/* Zero-Pill Unboxed Metadata with Typographic Separators */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-amber-400">{currentProject.subject}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{currentProject.audience}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{currentProject.scenes.length} Escenas de Alta Retención</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>
                {currentProject.scenes.reduce((acc, s) => acc + s.durationSeconds, 0)}s de Producción
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <span>{currentProject.title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {currentProject.subtitle}
            </p>
          </div>

          {/* Primary Formula Display */}
          {currentProject.primaryFormulaLatex && (
            <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex flex-col gap-1 shrink-0">
              <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400">
                Ecuación Rectora:
              </span>
              <MathFormula formula={currentProject.primaryFormulaLatex} displayMode={false} className="text-sm font-mono text-cyan-300" />
            </div>
          )}
        </section>

        {/* Video Player Master Stage (Supports 9:16 Shorts, 16:9 Cinema, 1:1) */}
        <section className="w-full flex justify-center">
          <VideoPlayer
            project={currentProject}
            currentSceneIndex={currentSceneIndex}
            onSceneChange={(idx) => setCurrentSceneIndex(idx)}
            onOpenQuiz={(scene) => setActiveQuizScene(scene)}
            onCanvasReady={(canvas) => setActiveCanvas(canvas)}
            format={videoFormat}
            onChangeFormat={(fmt) => setVideoFormat(fmt)}
            isViralCaptionsActive={isViralCaptionsActive}
          />
        </section>

        {/* Interactive Workspace Navigation Tabs */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 flex-wrap gap-2">
            {/* Segmented Functional Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-xl">
              <button
                onClick={() => setActiveTab('viral')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'viral'
                    ? 'bg-slate-800 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Viral Toolkit & Retención</span>
              </button>
              <button
                onClick={() => setActiveTab('script')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'script'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Guión & Storyboard
              </button>
              <button
                onClick={() => setActiveTab('objectives')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'objectives'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Objetivos Pedagógicos
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'catalog'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Catálogo STEM
              </button>
            </div>

            <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Optimizado para Shorts, Reels y TikTok</span>
            </div>
          </div>

          {/* Tab 0: Viral Toolkit */}
          {activeTab === 'viral' && (
            <ViralToolkit
              project={currentProject}
              activeFormat={videoFormat}
              onChangeFormat={(fmt) => setVideoFormat(fmt)}
              isViralCaptionsActive={isViralCaptionsActive}
              onToggleViralCaptions={() => setIsViralCaptionsActive(!isViralCaptionsActive)}
              onApplyTitle={handleApplyTitle}
            />
          )}

          {/* Tab 1: Detailed Script & Storyboard Editor */}
          {activeTab === 'script' && (
            <div className="min-h-[500px]">
              <ScriptEditor
                project={currentProject}
                activeSceneIndex={currentSceneIndex}
                onSelectScene={(idx) => setCurrentSceneIndex(idx)}
                onUpdateScene={handleUpdateScene}
                onRegenerateScenePrompt={handleRegenerateScenePrompt}
                isRegeneratingScene={isRegeneratingScene}
              />
            </div>
          )}

          {/* Tab 2: Learning Goals & Invariants */}
          {activeTab === 'objectives' && (
            <div className="p-6 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Gancho Conceptual de los 3 Segundos (The Viral Hook)</span>
                </h3>
                <blockquote className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs sm:text-sm text-amber-200 italic leading-relaxed">
                  "{currentProject.hook}"
                </blockquote>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Revelaciones Conceptuales</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {currentProject.learningGoals.map((goal, i) => (
                    <div
                      key={i}
                      className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-1.5"
                    >
                      <span className="text-[11px] font-mono text-amber-400 font-semibold">
                        Revelación 0{i + 1}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">{goal}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Desglose de Escenas y Ritmo de Retención</span>
                </h3>
                <div className="space-y-2">
                  {currentProject.scenes.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-slate-950/50 border border-slate-800/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-200">
                            {idx + 1}. {s.title}
                          </span>
                          <span className="text-slate-500 font-mono">({s.pedagogicalPhase})</span>
                          {s.soundEffectCue && s.soundEffectCue !== 'none' && (
                            <span className="text-[10px] text-rose-400 font-mono bg-rose-950/40 px-1.5 py-0.2 rounded border border-rose-800/40">
                              🔊 {s.soundEffectCue}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400">{s.visualConcept}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-800/40">
                          {s.visualType}
                        </span>
                        <button
                          onClick={() => {
                            setCurrentSceneIndex(idx);
                            setActiveTab('script');
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
                        >
                          Ver Guión
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Curated STEM Catalog */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Biblioteca de Clases Virales Demostrativas</h3>
                  <p className="text-xs text-slate-400">
                    Proyectos diseñados con ganchos de alto CTR listos para reproducir en 9:16 o 16:9
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SHOWCASE_PROJECTS.map((proj, idx) => {
                  const isCurrent = currentProject.title === proj.title;
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                        isCurrent
                          ? 'bg-slate-900 border-amber-500/60 shadow-xl shadow-amber-950/30'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Unboxed Metadata */}
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span className="font-semibold text-amber-400">{proj.subject}</span>
                          <span aria-hidden="true">·</span>
                          <span>{proj.scenes.length} Escenas</span>
                          {proj.viralTitles?.[0]?.estimatedCTR && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-emerald-400 font-mono">
                                ~{proj.viralTitles[0].estimatedCTR}% CTR
                              </span>
                            </>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-100 leading-snug">{proj.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {proj.subtitle}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-500">
                          {proj.scenes.reduce((acc, s) => acc + s.durationSeconds, 0)}s video
                        </span>
                        <button
                          onClick={() => {
                            handleSelectShowcase(proj);
                            setActiveTab('viral');
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          <span>{isCurrent ? 'En Reproducción' : 'Cargar Clase'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 px-6 py-6 text-center text-xs text-slate-500">
        <p>
          SciMotion Viral Studio · Automatizador de Videos Educativos para Matemáticas, Física e Ingeniería · Potenciado por Gemini AI
        </p>
      </footer>

      {/* Modals */}
      <GeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onGenerate={handleGenerateVideo}
        isGenerating={isGenerating}
      />

      {activeQuizScene && (
        <InteractiveQuizModal
          scene={activeQuizScene}
          isOpen={!!activeQuizScene}
          onClose={() => setActiveQuizScene(null)}
        />
      )}

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={currentProject}
        activeCanvas={activeCanvas}
      />
    </div>
  );
}
