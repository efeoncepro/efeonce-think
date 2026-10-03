/** AXIS orbit motion snapshot. Generated from @efeoncepro/axis-graphic-line 0.11.0/motion.
 * sha256 CSS: 3dcefd13d74ec4f90144712505ed120ca16e139ac3926f326bd0e3e89dec3276. Do not edit the choreography; regenerate from the package.
 * Think keeps the official SVG unchanged and inlines it to target its data-axis-part hooks.
 * No GSAP, React hydration or client JS. TASK-1966.
 */
export const orbitMotionCss = "@keyframes axis-orbit-ring { from { opacity: 0; transform: scale(.96) } to { opacity: 1; transform: none } }\n@keyframes axis-orbit-arc { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }\n@keyframes axis-orbit-sphere { 0% { opacity: 0; transform: scale(0) } 70% { opacity: 1; transform: scale(1.18) } 100% { opacity: 1; transform: none } }\n@keyframes axis-orbit-halo { from { opacity: 0 } to { opacity: 1 } }\n@keyframes axis-orbit-signature { from { opacity: 0; transform: translateY(12%) } to { opacity: 1; transform: none } }\n@keyframes axis-orbit-spotlight { 0% { transform: translate(-38%, 18%) } 55% { transform: translate(14%, -8%) } 100% { transform: none } }\n.axis-orbit-animate [data-axis-part=\"ring\"], .axis-orbit-animate [data-axis-part=\"inner-orbit\"] { transform-box: fill-box; transform-origin: center; animation: axis-orbit-ring 500ms cubic-bezier(0.2, 0, 0, 1) 0ms both }\n.axis-orbit-animate [data-axis-part=\"arc\"] { stroke-dasharray: 1 1; animation: axis-orbit-arc 1000ms cubic-bezier(0.4, 0, 0.2, 1) 400ms both }\n.axis-orbit-animate [data-axis-part=\"sphere\"], .axis-orbit-animate [data-axis-part=\"sphere-ring\"] { transform-box: fill-box; transform-origin: center; animation: axis-orbit-sphere 300ms cubic-bezier(0.2, 0, 0, 1) 1400ms both }\n.axis-orbit-animate [data-axis-part=\"halo\"] { animation: axis-orbit-halo 800ms cubic-bezier(0.4, 0, 0.2, 1) 1200ms both }\n.axis-orbit-animate [data-axis-part=\"signature\"] { transform-box: fill-box; animation: axis-orbit-signature 600ms cubic-bezier(0.2, 0, 0, 1) 1900ms both }\n.axis-orbit-animate [data-axis-part=\"spotlight-light\"], .axis-orbit-animate [data-axis-part=\"spotlight-orbit\"] { transform-box: view-box; animation: axis-orbit-spotlight 1400ms cubic-bezier(0.2, 0, 0, 1) 0ms both }\n@media (prefers-reduced-motion: reduce) { .axis-orbit-animate [data-axis-part] { animation: none !important; stroke-dasharray: none !important } }"
export const orbitMotionTimeline = {
  "ring": {
    "delayMs": 0,
    "durationMs": 500,
    "easing": "cubic-bezier(0.2, 0, 0, 1)"
  },
  "arc": {
    "delayMs": 400,
    "durationMs": 1000,
    "easing": "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  "sphere": {
    "delayMs": 1400,
    "durationMs": 300,
    "easing": "cubic-bezier(0.2, 0, 0, 1)"
  },
  "halo": {
    "delayMs": 1200,
    "durationMs": 800,
    "easing": "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  "signature": {
    "delayMs": 1900,
    "durationMs": 600,
    "easing": "cubic-bezier(0.2, 0, 0, 1)"
  },
  "spotlight": {
    "delayMs": 0,
    "durationMs": 1400,
    "easing": "cubic-bezier(0.2, 0, 0, 1)"
  }
} as const
export const orbitMotionTotalMs = 2500
