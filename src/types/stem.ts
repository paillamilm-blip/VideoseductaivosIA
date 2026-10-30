export type SubjectArea = 'Matemáticas' | 'Física' | 'Ingeniería';

export type VideoFormat = '9:16' | '16:9' | '1:1';

export type VisualType =
  | 'math_fourier'
  | 'math_riemann'
  | 'math_matrix'
  | 'physics_projectile'
  | 'physics_orbital'
  | 'physics_wave'
  | 'physics_electromagnetism'
  | 'eng_beam'
  | 'eng_circuit_rlc'
  | 'eng_thermo_carnot'
  | 'custom_canvas';

export type PedagogicalPhase =
  | 'Hook'
  | 'Intuición'
  | 'Formulación Rigurosa'
  | 'Aplicación en Ingeniería'
  | 'Síntesis';

export type ViralSoundEffect = 'whoosh' | 'impact_bass' | 'ding' | 'pop' | 'tension_riser' | 'none';

export interface InteractiveSlider {
  paramKey: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Scene {
  sceneNumber: number;
  title: string;
  pedagogicalPhase: PedagogicalPhase;
  durationSeconds: number;
  narration: string;
  visualType: VisualType;
  visualConcept: string;
  equations: string[];
  parameters: Record<string, number>;
  interactiveSliders?: InteractiveSlider[];
  speakerNotes: string;
  visualCues: string;
  takeawayPoint: string;
  quizQuestion?: QuizQuestion;
  soundEffectCue?: ViralSoundEffect;
  viralKeyword?: string; // Word highlighted in bold viral captions
}

export interface ViralTitleOption {
  title: string;
  hookType: 'Paradoja Contraintuitiva' | 'Pregunta Imposible' | 'El Mito Escolar' | 'Revelación Visual' | 'Misterio de Ingeniería';
  estimatedCTR: number; // e.g. 9.4%
}

export interface VideoProject {
  title: string;
  subtitle: string;
  subject: SubjectArea;
  audience: string;
  hook: string;
  primaryFormulaLatex: string;
  learningGoals: string[];
  scenes: Scene[];
  viralTitles?: ViralTitleOption[];
  viralHashtags?: string[];
  thumbnailPrompt?: string;
  retentionTip?: string;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  globalTime: number;
  currentSceneIndex: number;
  playbackRate: number;
  isNarrationEnabled: boolean;
  isInteractiveMode: boolean;
  volume: number;
  format: VideoFormat;
  isViralCaptionsActive: boolean;
}
