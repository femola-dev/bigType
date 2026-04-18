import * as THREE from 'three'

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not decode SVG as image'))
    img.src = url
  })
}

/**
 * Rasterize inline SVG markup to a canvas texture sized similarly to the text path
 * (height ~ fontSize × dpr, padded, preserving aspect ratio).
 */
export async function rasterizeSvgToTexture(
  svgMarkup: string,
  fontSize: number,
  dpr: number,
): Promise<{ texture: THREE.CanvasTexture; aspect: number }> {
  const trimmed = svgMarkup.trim()
  if (!trimmed) throw new Error('Empty SVG')

  const parser = new DOMParser()
  const doc = parser.parseFromString(trimmed, 'image/svg+xml')
  if (doc.querySelector('parsererror')) {
    throw new Error('Invalid SVG markup')
  }

  let svg: Element = doc.documentElement
  if (svg.tagName.toLowerCase() !== 'svg') {
    const inner = doc.querySelector('svg')
    if (!inner) throw new Error('No <svg> root found')
    svg = inner
  }

  const vb = svg.getAttribute('viewBox')
  let vbw = 100
  let vbh = 100
  if (vb) {
    const parts = vb.trim().split(/[\s,]+/).map(Number)
    if (parts.length >= 4 && parts.slice(2, 4).every((n) => !Number.isNaN(n))) {
      vbw = Math.max(1e-6, parts[2])
      vbh = Math.max(1e-6, parts[3])
    }
  }

  const aw = parseFloat(String(svg.getAttribute('width') || '').replace(/[^\d.-]/g, ''))
  const ah = parseFloat(String(svg.getAttribute('height') || '').replace(/[^\d.-]/g, ''))
  const naturalW = !Number.isNaN(aw) && aw > 0 ? aw : vbw
  const naturalH = !Number.isNaN(ah) && ah > 0 ? ah : vbh
  const ar = naturalW / naturalH

  const pad = fontSize * dpr * 0.5
  const targetH = Math.max(48, fontSize * dpr * 1.45 + pad)
  const maxW = targetH * 8
  let drawH = targetH
  let drawW = targetH * ar
  if (drawW > maxW) {
    drawW = maxW
    drawH = maxW / ar
  }

  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.setAttribute('width', String(drawW))
  svg.setAttribute('height', String(drawH))
  if (!svg.getAttribute('viewBox') && vbw > 0 && vbh > 0) {
    svg.setAttribute('viewBox', `0 0 ${vbw} ${vbh}`)
  }

  const serialized = new XMLSerializer().serializeToString(svg)
  const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  try {
    const img = await loadImage(url)
    const canvasW = Math.ceil(drawW + pad * 2)
    const canvasH = Math.ceil(drawH + pad * 2)
    const canvas = document.createElement('canvas')
    canvas.width = canvasW
    canvas.height = canvasH
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2D context unavailable')

    ctx.clearRect(0, 0, canvasW, canvasH)
    ctx.drawImage(img, pad, pad, drawW, drawH)

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.needsUpdate = true
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false
    return { texture, aspect: canvasW / canvasH }
  } finally {
    URL.revokeObjectURL(url)
  }
}
