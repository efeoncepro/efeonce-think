/**
 * Imagen para compartir el enlace del informe de Insights (TASK-1875): 1200×630, fondo oscuro, lockup
 * Efeonce | Insights y una sola órbita de acento. No lleva ningún dato del informe (el enlace es privado:
 * la vista previa en un chat nunca debe filtrar el contenido). Valores sólo desde `insights-tokens.ts`.
 *
 *   node scripts/build-insights-og.mjs   →  public/branding/insights/og-insights.png
 */
import { readFileSync } from 'node:fs'
import sharp from 'sharp'
import { orbita, orbitMeasure } from '../src/lib/insights-tokens.ts'

const W = 1200
const H = 630
const k = W / orbitMeasure.base.widthPx
const lockup = readFileSync(new URL('../public/branding/insights/insights-lockup-negative.svg', import.meta.url), 'utf8')
const [, vbW, vbH] = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(lockup) ?? []
const lockW = 520
const lockH = (lockW * Number(vbH)) / Number(vbW)

// Órbita de acento (trajectory.accent): anillo que sale por la derecha, arco de 50° con la esfera en la punta.
const cx = 1060
const cy = H / 2
const R = 360
const at = (deg) => [cx + R * Math.sin((deg * Math.PI) / 180), cy - R * Math.cos((deg * Math.PI) / 180)]
const endDeg = 300
const [x0, y0] = at(endDeg - orbitMeasure.trailDeg)
const [x1, y1] = at(endDeg)
const sphere = orbitMeasure.base.sphereRadiusPx * k * 1.6

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><radialGradient id="halo"><stop offset="0" stop-color="${orbita.halo}" stop-opacity=".55"/><stop offset="1" stop-color="${orbita.halo}" stop-opacity="0"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="${orbita.ground}"/>
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${orbita.inkSoftDark}" stroke-opacity="${orbitMeasure.ringOpacity}" stroke-width="${orbitMeasure.base.ringStrokePx * k}"/>
  <path d="M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}" fill="none" stroke="${orbita.accentDark}" stroke-width="${orbitMeasure.base.trailStrokePx * k}" stroke-linecap="round"/>
  <circle cx="${x1}" cy="${y1}" r="${sphere * orbitMeasure.haloRadiusRatio * 1.6}" fill="url(#halo)"/>
  <circle cx="${x1}" cy="${y1}" r="${sphere}" fill="${orbita.accentDark}"/>
  <svg x="96" y="${(H - lockH) / 2}" width="${lockW}" height="${lockH}" viewBox="0 0 ${vbW} ${vbH}">${lockup.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')}</svg>
</svg>`

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(new URL('../public/branding/insights/og-insights.png', import.meta.url).pathname)
console.log('og-insights.png', W, 'x', H)
