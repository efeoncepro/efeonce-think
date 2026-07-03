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

// ── Framework de niveles (labels + pregunta guía) — copy es-CL de greenhouse-eo ─
export const LEVEL_COPY: Record<string, { ordinal: string; label: string; question: string; coverageNote?: string }> = {
  found: { ordinal: '01', label: 'Que te encuentre', question: '¿Existes para la IA?' },
  readable: { ordinal: '02', label: 'Que te entienda', question: '¿Te puede leer sin adivinar?' },
  correct: {
    ordinal: '03',
    label: 'Que te represente bien',
    question: '¿Lo que dice de ti es verdad?',
    coverageNote: 'Qué tan fielmente te representa la IA.',
  },
  actionable: {
    ordinal: '04',
    label: 'Que pueda actuar',
    question: '¿Te pueden usar, no solo citar?',
    coverageNote: 'Si los agentes de IA pueden operar tu sitio.',
  },
  intrinsic: { ordinal: '05', label: 'Que te prefiera', question: '¿Eres el default?' },
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
