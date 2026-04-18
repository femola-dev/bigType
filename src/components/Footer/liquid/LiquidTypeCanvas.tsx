import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from '@react-three/fiber'
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import * as THREE from 'three'
import { rasterizeSvgToTexture } from './rasterizeSvg'
import { useFooterLiquidTheme } from './useFooterLiquidTheme'
import {
  getFontStack,
  getGlowTintHex,
  useFooterStore,
} from '../../../state/footerControls'
import fragSource from './shaders/liquidText.frag?raw'
import vertSource from './shaders/liquidText.vert?raw'
import lv from './liquidView.module.css'

const POINTER_LERP_FAST = 14
const POINTER_LERP_SLOW = 8

function hexToVec3(hex: string) {
  const c = new THREE.Color(hex)
  return new THREE.Vector3(c.r, c.g, c.b)
}

function createTextTexture(
  text: string,
  fontSize: number,
  fontWeight: string,
  fontStack: string,
  letterSpacingEm: number,
  dpr: number,
) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D context unavailable')

  const pad = fontSize * dpr * 0.5
  const font = `${fontWeight} ${fontSize * dpr}px ${fontStack}`
  ctx.font = font
  ctx.letterSpacing = `${letterSpacingEm * fontSize * dpr}px`
  const metrics = ctx.measureText(text)
  const w = Math.ceil(metrics.width + pad * 2)
  const h = Math.ceil(fontSize * dpr * 1.45 + pad)

  canvas.width = w
  canvas.height = h
  ctx.font = font
  ctx.letterSpacing = `${letterSpacingEm * fontSize * dpr}px`
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, w / 2, h / 2)

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.needsUpdate = true
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.generateMipmaps = false
  return { texture: tex, aspect: w / h }
}

function LiquidPlane({
  text,
  liquidSourceMode,
  importedSvgMarkup,
  fontSize,
  fontWeight,
  letterSpacing,
  fontStack,
  reaction,
  breeze,
  glow,
  glowColor,
  baseColor,
  lightScheme,
}: {
  text: string
  liquidSourceMode: 'text' | 'svg'
  importedSvgMarkup: string | null
  fontSize: number
  fontWeight: string
  letterSpacing: number
  fontStack: string
  reaction: number
  breeze: number
  glow: number
  glowColor: string
  baseColor: string
  lightScheme: number
}) {
  const viewport = useThree((s) => s.viewport)
  const dpr = useThree((s) => Math.min(s.viewport.dpr, 2))
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const targetPointer = useRef(new THREE.Vector2(0.5, 0.5))
  const smoothPointer = useRef(new THREE.Vector2(0.5, 0.5))
  const prevPointer = useRef(new THREE.Vector2(0.5, 0.5))

  const emptyTex = useMemo(() => {
    const data = new Uint8Array([0, 0, 0, 0])
    const t = new THREE.DataTexture(data, 1, 1)
    t.needsUpdate = true
    return t
  }, [])
  useEffect(() => () => emptyTex.dispose(), [emptyTex])

  const textPayload = useMemo(() => {
    if (liquidSourceMode !== 'text') return null
    return createTextTexture(
      text,
      fontSize,
      fontWeight,
      fontStack,
      letterSpacing,
      dpr,
    )
  }, [
    liquidSourceMode,
    text,
    fontSize,
    fontWeight,
    fontStack,
    letterSpacing,
    dpr,
  ])

  useEffect(() => {
    return () => textPayload?.texture.dispose()
  }, [textPayload])

  const [svgPayload, setSvgPayload] = useState<{
    texture: THREE.CanvasTexture
    aspect: number
  } | null>(null)

  useEffect(() => {
    if (liquidSourceMode !== 'svg' || !importedSvgMarkup?.trim()) {
      setSvgPayload((prev) => {
        if (prev) prev.texture.dispose()
        return null
      })
      return
    }

    let cancelled = false
    rasterizeSvgToTexture(importedSvgMarkup.trim(), fontSize, dpr)
      .then((res) => {
        if (cancelled) {
          res.texture.dispose()
          return
        }
        setSvgPayload((prev) => {
          if (prev) prev.texture.dispose()
          return { texture: res.texture, aspect: res.aspect }
        })
      })
      .catch(() => {
        if (!cancelled) {
          setSvgPayload((prev) => {
            if (prev) prev.texture.dispose()
            return null
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [liquidSourceMode, importedSvgMarkup, fontSize, dpr])

  const { texture, aspect } = useMemo(() => {
    if (liquidSourceMode === 'text' && textPayload) {
      return { texture: textPayload.texture, aspect: textPayload.aspect }
    }
    if (liquidSourceMode === 'svg' && svgPayload) {
      return { texture: svgPayload.texture, aspect: svgPayload.aspect }
    }
    return { texture: emptyTex, aspect: 1 }
  }, [liquidSourceMode, textPayload, svgPayload, emptyTex])

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uPointerVel: { value: new THREE.Vector2(0, 0) },
      uScrollVel: { value: new THREE.Vector2(0, 0) },
      uScrollStretchAnchor: { value: 0 },
      uReaction: { value: reaction },
      uBreeze: { value: breeze },
      uGlow: { value: glow },
      uGlowColor: { value: hexToVec3(glowColor) },
      uColor: { value: hexToVec3(baseColor) },
      uAlpha: { value: 1 },
      uLightScheme: { value: lightScheme },
    }),
    [texture], // eslint-disable-line react-hooks/exhaustive-deps -- scalars synced in useEffect
  )

  useEffect(() => {
    const m = materialRef.current
    if (!m) return
    m.uniforms.uReaction.value = reaction
    m.uniforms.uBreeze.value = breeze
    m.uniforms.uGlow.value = glow
    m.uniforms.uGlowColor.value = hexToVec3(glowColor)
    m.uniforms.uColor.value = hexToVec3(baseColor)
    m.uniforms.uLightScheme.value = lightScheme
  }, [reaction, breeze, glow, glowColor, baseColor, lightScheme])

  useFrame((_, delta) => {
    const m = materialRef.current
    if (!m) return
    const amt1 = Math.min(1, delta * POINTER_LERP_FAST)
    const amt2 = Math.min(1, delta * POINTER_LERP_SLOW)
    const p = m.uniforms.uPointer.value as THREE.Vector2
    const vel = m.uniforms.uPointerVel.value as THREE.Vector2
    smoothPointer.current.lerp(targetPointer.current, amt1)
    p.lerp(smoothPointer.current, amt2)
    vel.subVectors(p, prevPointer.current)
    prevPointer.current.copy(p)
  })

  const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (e.uv) {
      targetPointer.current.copy(e.uv)
    }
  }, [])

  const planeScale: [number, number, number] = useMemo(() => {
    const vAspect = viewport.width / viewport.height
    let w = viewport.width
    let h = viewport.height
    if (aspect > vAspect) {
      h = w / aspect
    } else {
      w = h * aspect
    }
    return [w, h, 1]
  }, [viewport.width, viewport.height, aspect])

  return (
    <mesh scale={planeScale} onPointerMove={onPointerMove}>
      <planeGeometry />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={vertSource}
        fragmentShader={fragSource}
      />
    </mesh>
  )
}

function LiquidScene({
  textColor,
  scheme,
}: {
  textColor: string
  scheme: 'light' | 'dark'
}) {
  const text = useFooterStore((s) => s.text)
  const liquidSourceMode = useFooterStore((s) => s.liquidSourceMode)
  const importedSvgMarkup = useFooterStore((s) => s.importedSvgMarkup)
  const fontSize = useFooterStore((s) => s.fontSize)
  const fontWeight = useFooterStore((s) => s.fontWeight)
  const fontPreset = useFooterStore((s) => s.fontPreset)
  const letterSpacing = useFooterStore((s) => s.letterSpacing)
  const fontStack = useMemo(() => getFontStack(fontPreset), [fontPreset])
  const reaction = useFooterStore((s) => s.reaction)
  const breeze = useFooterStore((s) => s.breeze)
  const glow = useFooterStore((s) => s.glow)
  const glowTintPreset = useFooterStore((s) => s.glowTintPreset)
  const glowColor = useMemo(
    () => getGlowTintHex(glowTintPreset),
    [glowTintPreset],
  )
  const lightScheme = scheme === 'light' ? 1 : 0

  return (
    <Suspense fallback={null}>
      <LiquidPlane
        text={text}
        liquidSourceMode={liquidSourceMode}
        importedSvgMarkup={importedSvgMarkup}
        fontSize={fontSize}
        fontWeight={fontWeight}
        letterSpacing={letterSpacing}
        fontStack={fontStack}
        reaction={reaction}
        breeze={breeze}
        glow={glow}
        glowColor={glowColor}
        baseColor={textColor}
        lightScheme={lightScheme}
      />
    </Suspense>
  )
}

export function LiquidTypeCanvas() {
  const { background, text: textColor, scheme } = useFooterLiquidTheme()
  const text = useFooterStore((s) => s.text)
  const fontSize = useFooterStore((s) => s.fontSize)
  const fontWeight = useFooterStore((s) => s.fontWeight)
  const fontPreset = useFooterStore((s) => s.fontPreset)
  const fontStack = getFontStack(fontPreset)

  const [webglFailed, setWebglFailed] = useState(false)

  if (webglFailed) {
    return (
      <div
        className={`${lv.liquidView} ${lv.liquidFallback}`}
        style={{ background }}
      >
        <p
          className={lv.liquidFallbackType}
          style={{
            color: textColor,
            fontWeight,
            fontFamily: fontStack,
            fontSize: `clamp(2rem, 8vw, ${fontSize}px)`,
          }}
        >
          {text}
        </p>
        <span className={lv.liquidFallbackHint}>
          WebGL unavailable — CSS fallback
        </span>
      </div>
    )
  }

  return (
    <div
      className={lv.liquidView}
      style={{ background }}
      aria-label="Liquid type preview"
    >
      <Canvas
        className={lv.liquidCanvas}
        orthographic
        camera={{ position: [0, 0, 10], near: 0.1, far: 20, zoom: 100 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
        onError={() => setWebglFailed(true)}
      >
        <LiquidScene textColor={textColor} scheme={scheme} />
      </Canvas>
    </div>
  )
}
