import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Video project generation endpoint with Viral Mechanics
app.post('/api/generate-video', async (req: Request, res: Response) => {
  try {
    const {
      topic = 'Tiro parabólico con resistencia del aire',
      subject = 'Física',
      audience = 'General / Viral',
      tone = 'Viral, Dinámico y Misterioso (estilo Veritasium & 3Blue1Brown)',
      duration = '60 segundos (Shorts / Reels)',
      language = 'es',
      customInstructions = '',
    } = req.body;

    if (!ai) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY no está configurada en el servidor. Revisa el panel de Secrets.',
      });
    }

    const systemPrompt = `Eres el director de contenido y guionista principal de los canales educativos más virales del mundo (como Veritasium, Mark Rober, 3Blue1Brown y Kurzgesagt).
Tu misión es transformar conceptos complejos de MATEMÁTICAS, FÍSICA o INGENIERÍA en VIDEOS HIPNOTIZANTES Y ALTAMENTE VIRALES para TikTok, YouTube Shorts, Reels y formato extendido.

REGLAS DE ORO DE VIRALIDAD Y RETENCIÓN:
1. 'Gancho de los 3 Segundos' (Hook): La primera frase DEBE detener el scroll. Debe plantear una paradoja contraintuitiva, un error que todos creen cierto, o una pregunta que parezca imposible.
2. 'Cadencia y Ritmo Acelerado': Sin introducciones aburridas ni saludos ("Hola a todos..."). Entra directo a la acción con energía.
3. 'Tensión & Recompensa (Aha! Moment)': Plantea un misterio o contradicción visual en los primeros 10 segundos y mantén la resolución hasta la escena de intuición/formulación.
4. 'Titulares con Alto CTR': Genera 4 variantes de títulos virales con ángulos irresistibles (Paradoja Contraintuitiva, Pregunta Imposible, El Mito Escolar, Revelación Visual).
5. 'Efectos de Sonido Estratégicos': Cada escena debe tener un cue de audio viral ('whoosh', 'impact_bass', 'pop', 'ding', 'tension_riser') para mantener despierto al espectador.
6. 'Palabras Clave de Subtítulo Viral': Para cada escena, define la 'viralKeyword' (la palabra de alto impacto que se resalta en amarillo/cyan en los subtítulos dinámicos estilo TikTok).

Tipos de simulación visual disponibles en nuestro motor Canvas:
- 'math_fourier': Suma de armónicos sinusoidales de Fourier, epiciclos rotatorios, espectro frecuencial.
- 'math_riemann': Cálculo integral, sumas de Riemann con rectángulos dinámicos y convergencia.
- 'math_matrix': Transformaciones lineales 2D, vectores base i-hat y j-hat, determinante como área.
- 'physics_projectile': Tiro parabólico con gravedad y arrastre aerodinámico, vectores vx/vy.
- 'physics_orbital': Mecánica orbital gravitatoria, 2ª Ley de Kepler de áreas iguales en tiempos iguales.
- 'physics_wave': Interferencia y difracción de Young, franjas constructivas y destructivas.
- 'physics_electromagnetism': Líneas de campo electrostático, cargas puntuales y fuerzas de Coulomb.
- 'eng_beam': Viga simplemente apoyada con carga, diagramas de cortante V(x) y momento flector M(x).
- 'eng_circuit_rlc': Circuito RLC serie, oscilación amortiguada y resonancia transitoria.
- 'eng_thermo_carnot': Ciclo de Carnot en diagrama P-V, isotermas y adiabáticas.
- 'custom_canvas': Simulación matemática personalizada.

Escribe en ${language === 'en' ? 'Inglés' : 'Español'}.`;

    const userPrompt = `Genera un video educativo viral de alto impacto sobre:
Tema: "${topic}"
Área: ${subject}
Audiencia: ${audience}
Tono: ${tone}
Duración estimada: ${duration}
Idioma: ${language}
${customInstructions ? `Instrucciones especiales: ${customInstructions}` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Título principal viral de alto impacto' },
            subtitle: { type: Type.STRING, description: 'Subtítulo conceptual rápido' },
            subject: { type: Type.STRING },
            audience: { type: Type.STRING },
            hook: { type: Type.STRING, description: 'Frase gancho viral de los primeros 3 segundos' },
            primaryFormulaLatex: { type: Type.STRING, description: 'Fórmula rectora en formato LaTeX' },
            learningGoals: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 revelaciones clave que el espectador aprenderá',
            },
            viralTitles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  hookType: {
                    type: Type.STRING,
                    description: 'Paradoja Contraintuitiva, Pregunta Imposible, El Mito Escolar, Revelación Visual o Misterio de Ingeniería',
                  },
                  estimatedCTR: { type: Type.NUMBER, description: 'Porcentaje estimado de CTR (ej: 8.5 a 14.2)' },
                },
                required: ['title', 'hookType', 'estimatedCTR'],
              },
            },
            viralHashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Hashtags optimizados para TikTok, Shorts y Reels',
            },
            thumbnailPrompt: {
              type: Type.STRING,
              description: 'Instrucción detallada para diseñar una miniatura viral de YouTube con alto CTR',
            },
            retentionTip: {
              type: Type.STRING,
              description: 'Consejo técnico de ritmo y retención de audiencia para este video',
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  pedagogicalPhase: {
                    type: Type.STRING,
                    description: 'Hook, Intuición, Formulación Rigurosa, Aplicación en Ingeniería o Síntesis',
                  },
                  durationSeconds: { type: Type.NUMBER },
                  narration: { type: Type.STRING, description: 'Locución enérgica, sin relleno, frases directas' },
                  visualType: {
                    type: Type.STRING,
                    description: 'Uno de: math_fourier, math_riemann, math_matrix, physics_projectile, physics_orbital, physics_wave, physics_electromagnetism, eng_beam, eng_circuit_rlc, eng_thermo_carnot, custom_canvas',
                  },
                  visualConcept: { type: Type.STRING },
                  equations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      angleDeg: { type: Type.NUMBER },
                      velocity: { type: Type.NUMBER },
                      gravity: { type: Type.NUMBER },
                      airResistance: { type: Type.NUMBER },
                      harmonicsCount: { type: Type.NUMBER },
                      fundamentalFreq: { type: Type.NUMBER },
                      subdivisions: { type: Type.NUMBER },
                      matrixA: { type: Type.NUMBER },
                      matrixB: { type: Type.NUMBER },
                      matrixC: { type: Type.NUMBER },
                      matrixD: { type: Type.NUMBER },
                      beamLength: { type: Type.NUMBER },
                      pointLoad: { type: Type.NUMBER },
                      loadPosition: { type: Type.NUMBER },
                      damping: { type: Type.NUMBER },
                      inductance: { type: Type.NUMBER },
                      capacitance: { type: Type.NUMBER },
                      chargeQ1: { type: Type.NUMBER },
                      chargeQ2: { type: Type.NUMBER },
                    },
                  },
                  interactiveSliders: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        paramKey: { type: Type.STRING },
                        label: { type: Type.STRING },
                        min: { type: Type.NUMBER },
                        max: { type: Type.NUMBER },
                        step: { type: Type.NUMBER },
                        defaultValue: { type: Type.NUMBER },
                        unit: { type: Type.STRING },
                      },
                      required: ['paramKey', 'label', 'min', 'max', 'step', 'defaultValue', 'unit'],
                    },
                  },
                  speakerNotes: { type: Type.STRING },
                  visualCues: { type: Type.STRING },
                  takeawayPoint: { type: Type.STRING },
                  soundEffectCue: {
                    type: Type.STRING,
                    description: 'whoosh, impact_bass, pop, ding, tension_riser o none',
                  },
                  viralKeyword: {
                    type: Type.STRING,
                    description: 'Palabra clave de alto impacto para destacar en subtítulos virales',
                  },
                  quizQuestion: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      correctIndex: { type: Type.INTEGER },
                      explanation: { type: Type.STRING },
                    },
                  },
                },
                required: [
                  'sceneNumber',
                  'title',
                  'pedagogicalPhase',
                  'durationSeconds',
                  'narration',
                  'visualType',
                  'visualConcept',
                  'equations',
                  'takeawayPoint',
                ],
              },
            },
          },
          required: [
            'title',
            'subtitle',
            'subject',
            'audience',
            'hook',
            'primaryFormulaLatex',
            'learningGoals',
            'viralTitles',
            'viralHashtags',
            'scenes',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error('Respuesta vacía de Gemini');
    const projectData = JSON.parse(text);

    return res.json({ success: true, project: projectData });
  } catch (error: any) {
    console.error('Error generating viral video project:', error);
    return res.status(500).json({
      error: error?.message || 'Error al generar video viral con IA.',
    });
  }
});

// Scene regeneration endpoint
app.post('/api/regenerate-scene', async (req: Request, res: Response) => {
  try {
    const { currentScene, videoTopic, enhancementPrompt } = req.body;

    if (!ai) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no configurada' });
    }

    const prompt = `Reescribe y perfecciona la siguiente escena para maximizar la VIRALIDAD, RETENCIÓN y CLARIDAD VISUAL sobre "${videoTopic}".
Instrucción de mejora: "${enhancementPrompt || 'Haz el gancho más provocativo, añade un efecto de sonido viral e intensifica la revelación'}".

Escena actual:
${JSON.stringify(currentScene, null, 2)}

Devuelve la escena actualizada en JSON manteniendo el esquema de campos.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) throw new Error('Respuesta vacía de Gemini');
    const updatedScene = JSON.parse(text);

    return res.json({ success: true, scene: updatedScene });
  } catch (error: any) {
    console.error('Error regenerating scene:', error);
    return res.status(500).json({ error: error?.message || 'Error al regenerar escena' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`SciMotion Server running on http://localhost:${PORT}`);
  });
}

startServer();
