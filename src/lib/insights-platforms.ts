/**
 * Isotipos de plataforma de Insights (TASK-1996): copias de AXIS_PLATFORM_ASSETS (@efeoncepro/axis-brand-assets 0.4.15) en
 * `public/logos/platforms/`, uno por canal del vocabulario de Greenhouse (`INSIGHT_CHANNEL_IDS`, 19 plataformas).
 * Greenhouse decide dónde va cada isotipo; Think sólo lo dibuja. Una plataforma sin archivo queda con su nombre.
 */
export const PLATFORM_LOGO: Record<string, string> = {
  chatgpt: '/logos/platforms/chatgpt.svg',
  gemini: '/logos/platforms/gemini.svg',
  claude: '/logos/platforms/claude.svg',
  perplexity: '/logos/platforms/perplexity.svg',
  google: '/logos/platforms/google.svg',
  google_ai_overview: '/logos/platforms/google-ai-overview.svg',
  google_search_console: '/logos/platforms/search-console.svg',
  google_analytics: '/logos/platforms/google-analytics.svg',
  greenhouse: '/logos/platforms/greenhouse.svg',
  google_ads: '/logos/platforms/google-ads.svg',
  bing: '/logos/platforms/bing.svg',
  youtube: '/logos/platforms/youtube.svg',
  reddit: '/logos/platforms/reddit.svg',
  wikipedia: '/logos/platforms/wikipedia.svg',
  linkedin: '/logos/platforms/linkedin.svg',
  instagram: '/logos/platforms/instagram.svg',
  tiktok: '/logos/platforms/tiktok.svg',
  meta: '/logos/platforms/meta.svg',
  frameio: '/logos/platforms/frameio.svg'
}

export const platformLogoOf = (platform: string | null | undefined): string | null => (platform ? PLATFORM_LOGO[platform] ?? null : null)
