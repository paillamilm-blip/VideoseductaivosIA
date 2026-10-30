import React, { useState, useRef, useEffect } from 'react';
import { VideoProject } from '../types/stem';
import { Download, Video, FileText, Code2, Check, X, Loader2, Play } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject;
  activeCanvas: HTMLCanvasElement | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  activeCanvas,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedSeconds, setRecordedSeconds] = useState<number>(0);
  const [recordingSuccess, setRecordingSuccess] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // 1. Record Canvas to WebM Video
  const handleStartRecording = () => {
    if (!activeCanvas) {
      alert('El lienzo de simulación no está activo.');
      return;
    }

    try {
      const stream = activeCanvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const sanitizedTitle = project.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
        a.download = `video_${sanitizedTitle}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
        setRecordingSuccess(true);
        setTimeout(() => setRecordingSuccess(false), 4000);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordedSeconds(0);

      recordIntervalRef.current = setInterval(() => {
        setRecordedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting video recording:', err);
      alert('Tu navegador no permite la grabación directa de Canvas stream.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      mediaRecorderRef.current.stop();
    }
  };

  // 2. Export Script as Markdown with LaTeX
  const handleDownloadMarkdown = () => {
    const mdContent = `# ${project.title}
*${project.subtitle}*

**Disciplina:** ${project.subject} | **Audiencia:** ${project.audience}  
**Ecuación Primaria:** $${project.primaryFormulaLatex}$

## Gancho Pedagógico (Hook)
> "${project.hook}"

## Objetivos de Aprendizaje
${project.learningGoals.map((g) => `- ${g}`).join('\n')}

---

## Guión Escena por Escena

${project.scenes
  .map(
    (s, idx) => `### Escena ${s.sceneNumber}: ${s.title}
- **Fase Pedagógica:** ${s.pedagogicalPhase}
- **Duración Estimada:** ${s.durationSeconds} segundos
- **Tipo de Visualización:** \`${s.visualType}\`
- **Concepto Visual:** ${s.visualConcept}

#### Locución en Off (Narration)
${s.narration}

#### Notas de Dirección
- **Locutor:** ${s.speakerNotes}
- **Cámara & Animación:** ${s.visualCues}

#### Ecuaciones en Pantalla
${s.equations.map((eq) => `$$${eq}$$`).join('\n')}

#### Conclusión Clave
**${s.takeawayPoint}**

${
  s.quizQuestion
    ? `#### Desafío Conceptual
*Pregunta:* ${s.quizQuestion.question}  
${s.quizQuestion.options.map((o, i) => `- [${i === s.quizQuestion?.correctIndex ? 'x' : ' '}] ${o}`).join('\n')}  
*Explicación:* ${s.quizQuestion.explanation}
`
    : ''
}
`
  )
  .join('\n---\n\n')}

---
*Generado automáticamente por SciMotion Studio con Inteligencia Artificial STEM.*
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedTitle = project.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `guion_${sanitizedTitle}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 3. Export JSON Configuration
  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedTitle = project.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `proyecto_${sanitizedTitle}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Exportar Video y Recursos</h3>
              <p className="text-xs text-slate-400">Descarga la animación renderizada o el guión completo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Option 1: Live Canvas Video Recording */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-100">Grabar y Exportar Video WebM</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
                HD 60fps
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Captura directamente la simulación matemática en tiempo real del Canvas HTML5 para guardarla como clip de
              video.
            </p>

            <div className="pt-1 flex items-center justify-between">
              {isRecording ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-mono animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Grabando: {recordedSeconds}s</span>
                  </div>
                  <button
                    onClick={handleStopRecording}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                  >
                    Detener y Descargar
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartRecording}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Iniciar Grabación de Escena</span>
                </button>
              )}

              {recordingSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Video guardado
                </span>
              )}
            </div>
          </div>

          {/* Option 2: Full Pedagogical Script Markdown */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-100">Guión Pedagógico (Markdown + LaTeX)</span>
              </div>
              <p className="text-xs text-slate-400">
                Texto para locución, notas de producción, fórmulas y preguntas.
              </p>
            </div>
            <button
              onClick={handleDownloadMarkdown}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0"
            >
              Descargar .md
            </button>
          </div>

          {/* Option 3: JSON Project */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-slate-100">Archivo de Proyecto SciMotion (JSON)</span>
              </div>
              <p className="text-xs text-slate-400">
                Exporta la estructura completa para archivar o importar luego.
              </p>
            </div>
            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shrink-0"
            >
              Descargar .json
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
