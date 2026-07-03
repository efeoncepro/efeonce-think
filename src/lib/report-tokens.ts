/**
 * Capa de presentación del informe: colores AXIS (copiados 1:1 de greenhouse-eo
 * `src/@core/theme/axis-tokens.ts`) + mapeos de severidad / niveles / motores.
 *
 * TASK-1325 decisión práctica: tokens AXIS copiados ahora; paquete compartido con
 * efeonce-web después (al converger). NO hardcodear HEX en el JSX — resolver desde acá.
 */

// ── AXIS ramps (subset usado por el informe) — 1:1 con axis-tokens.ts ─────────
export const axis = {
  accent: { 500: '#0375db', 700: '#024c8f', 800: '#023c70', 900: '#00284d' },
  success: { 100: '#e7f6ee', 500: '#157f47', 700: '#0f5e35' },
  warning: { 100: '#fff3d6', 500: '#ffb703', 700: '#8a6300' },
  error: { 100: '#fdecec', 500: '#dc2e39', 700: '#9e1820' },
  gray: { 50: '#f7f7f8', 100: '#eaeaec', 200: '#d5d4d8', 400: '#aba8b1', 600: '#6d6777', 800: '#433c50', 900: '#2e263d' },
} as const

// ── Severidad → tono semántico (nunca color-only) ─────────────────────────────
export type GraderSeverity = 'optimo' | 'atencion' | 'critico' | 'sin_dato'

export interface SeverityMeta {
  label: string
  fg: string
  bg: string
  border: string
}

export const severityMeta = (severity: string): SeverityMeta => {
  switch (severity as GraderSeverity) {
    case 'optimo':
      return { label: 'Óptimo', fg: axis.success[700], bg: axis.success[100], border: axis.success[500] }
    case 'atencion':
      return { label: 'Atención', fg: axis.warning[700], bg: axis.warning[100], border: axis.warning[500] }
    case 'critico':
      return { label: 'Crítico', fg: axis.error[700], bg: axis.error[100], border: axis.error[500] }
    default:
      return { label: 'Sin dato', fg: axis.gray[600], bg: axis.gray[100], border: axis.gray[200] }
  }
}

// ── Framework AEO: los 5 niveles de madurez (fuente: efeoncepro.com/aeo-2) ─────
// Es una ESCALERA que se sube en orden: cada nivel se apoya en el anterior.
export interface LevelCopy {
  ordinal: string
  label: string
  labelEn: string
  tier: string
  result: string
  desc: string
  question: string
}
export const LEVEL_COPY: Record<string, LevelCopy> = {
  found: {
    ordinal: '01', label: 'Que te encuentre', labelEn: 'Be Found', tier: 'Base', result: 'Visible',
    desc: 'Estás indexado y visible para los motores de IA. Si no te encuentran, nada más importa.',
    question: '¿Existes para la IA?',
  },
  readable: {
    ordinal: '02', label: 'Que te entienda', labelEn: 'Be Readable', tier: 'Base', result: 'Legible',
    desc: 'Los motores leen tu estructura, tu schema y tu contenido sin ambigüedad.',
    question: '¿Te puede leer sin adivinar?',
  },
  correct: {
    ordinal: '03', label: 'Que te describa bien', labelEn: 'Be Correct', tier: 'Alto riesgo', result: 'Preciso',
    desc: 'Lo que la IA dice de ti es verdad: sin features inventadas, precios viejos ni confusión con tu competencia.',
    question: '¿Lo que dice de ti es verdad?',
  },
  actionable: {
    ordinal: '04', label: 'Que pueda actuar', labelEn: 'Be Actionable', tier: 'Sistema', result: 'Accionable',
    desc: 'Un agente de IA puede comparar, reservar o comprar en tu sitio sin fricción.',
    question: '¿Te pueden usar, no solo citar?',
  },
  intrinsic: {
    ordinal: '05', label: 'Que te prefiera', labelEn: 'Be Intrinsic', tier: 'La meta', result: 'Preferido',
    desc: 'Eres la recomendación por defecto: parte de cómo la IA entiende tu categoría.',
    question: '¿Eres el default?',
  },
}

export const AXIS_LABEL: Record<string, { title: string; tag: string; helper: string }> = {
  perception: {
    title: 'Eje de percepción',
    tag: 'Percepción · ¿te mencionan?',
    helper: 'Cómo los motores te encuentran, entienden, representan y recomiendan.',
  },
  agentic: {
    title: 'Eje de operabilidad',
    tag: 'Operabilidad · ¿te pueden usar?',
    helper: 'Qué tan listo está tu sitio para que un agente pueda actuar, no solo citarte.',
  },
}

// ── Motores (label legible) ───────────────────────────────────────────────────
export const PROVIDER_LABEL: Record<string, string> = {
  gemini: 'Gemini',
  google_ai_overview: 'Google AI Overview',
  google_ai_mode: 'Google AI Mode',
  chatgpt: 'ChatGPT',
  openai: 'ChatGPT',
  perplexity: 'Perplexity',
  copilot: 'Copilot',
  claude: 'Claude',
}

export const providerLabel = (provider: string): string =>
  PROVIDER_LABEL[provider] ?? provider.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
