import fs from 'fs'
import path from 'path'

const outputDir = path.resolve('public')

const specs = [
  { name: 'icon-192.ppm', size: 192, inset: 32 },
  { name: 'apple-touch-icon-source.ppm', size: 180, inset: 28 },
  { name: 'icon-512.ppm', size: 512, inset: 82 },
  { name: 'icon-512-maskable.ppm', size: 512, inset: 112 },
]

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function makePixel(x, y, size, inset) {
  const t = (x + y) / (2 * size)
  const bg = {
    r: Math.round(22 - 10 * t),
    g: Math.round(179 - 34 * t),
    b: Math.round(110 - 21 * t),
  }

  let color = bg
  const cardLeft = inset
  const cardTop = inset + size * 0.1
  const cardRight = size - inset
  const cardBottom = size - inset * 0.75
  const stripeTop = cardTop + (cardBottom - cardTop) * 0.25
  const stripeBottom = stripeTop + (cardBottom - cardTop) * 0.18
  const lockLeft = cardLeft + (cardRight - cardLeft) * 0.18
  const lockTop = stripeBottom + (cardBottom - stripeBottom) * 0.18
  const lockRight = cardRight - (cardRight - cardLeft) * 0.18
  const lockBottom = cardBottom - (cardBottom - stripeBottom) * 0.16

  if (x >= cardLeft && x <= cardRight && y >= cardTop && y <= cardBottom) {
    color = { r: 245, g: 252, b: 248 }
  }

  if (x >= cardLeft && x <= cardRight && y >= stripeTop && y <= stripeBottom) {
    color = { r: 12, g: 15, b: 20 }
  }

  if (x >= lockLeft && x <= lockRight && y >= lockTop && y <= lockBottom) {
    color = { r: 22, g: 179, b: 110 }
  }

  const cx = size / 2
  const cy = lockTop + (lockBottom - lockTop) * 0.45
  const shackleRadius = (lockRight - lockLeft) * 0.3
  const dist = Math.hypot(x - cx, y - cy)
  const shackleThickness = Math.max(2, Math.round(size * 0.03))

  if (
    dist <= shackleRadius &&
    dist >= shackleRadius - shackleThickness &&
    y <= cy
  ) {
    color = { r: 12, g: 15, b: 20 }
  }

  if (
    x >= cx - shackleRadius &&
    x <= cx + shackleRadius &&
    y >= cy &&
    y <= cy + shackleThickness * 0.8
  ) {
    color = { r: 12, g: 15, b: 20 }
  }

  return `${clamp(color.r, 0, 255)} ${clamp(color.g, 0, 255)} ${clamp(color.b, 0, 255)}`
}

for (const spec of specs) {
  const rows = []
  rows.push(`P3\n${spec.size} ${spec.size}\n255`)
  for (let y = 0; y < spec.size; y += 1) {
    const row = []
    for (let x = 0; x < spec.size; x += 1) {
      row.push(makePixel(x, y, spec.size, spec.inset))
    }
    rows.push(row.join(' '))
  }
  fs.writeFileSync(path.join(outputDir, spec.name), `${rows.join('\n')}\n`)
}
