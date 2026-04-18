import { useCallback, useRef, type ChangeEvent } from 'react'
import { button, useControls } from 'leva'
import {
  FONT_STACKS,
  type FontPreset,
  type GlowTintPreset,
  type TextScrollStretchPosition,
  GLOW_TINT_PRESETS,
  useFooterStore,
} from '../state/footerControls'

const fontWeights = ['100', '200', '300', '400', '500', '600', '700', '800', '900']

const fontPresetOptions = Object.keys(FONT_STACKS) as FontPreset[]

const glowTintOptions = Object.keys(GLOW_TINT_PRESETS) as GlowTintPreset[]

const textScrollStretchOptions = [
  'bottom',
  'top',
  'left',
  'right',
] as const satisfies readonly TextScrollStretchPosition[]

export function FooterTweakPanel() {
  const setField = useFooterStore((s) => s.setField)
  const text = useFooterStore((s) => s.text)
  const liquidSourceMode = useFooterStore((s) => s.liquidSourceMode)
  const fontPreset = useFooterStore((s) => s.fontPreset)
  const fontSize = useFooterStore((s) => s.fontSize)
  const fontWeight = useFooterStore((s) => s.fontWeight)
  const letterSpacing = useFooterStore((s) => s.letterSpacing)
  const svgFileInputRef = useRef<HTMLInputElement>(null)
  const s = useFooterStore.getState()

  const onSvgSelected = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        setField('importedSvgMarkup', String(reader.result ?? ''))
        setField('liquidSourceMode', 'svg')
      }
      reader.readAsText(file)
    },
    [setField],
  )

  useControls(
    'Text',
    {
      liquidSourceMode: {
        value: liquidSourceMode,
        options: ['text', 'svg'],
        label: 'source',
        onChange: (v) => setField('liquidSourceMode', v),
      },
      text: {
        value: text,
        order: 1,
        onChange: (v) => setField('text', v),
        disabled: liquidSourceMode === 'svg',
      },
      importSvgFile: button(
        () => svgFileInputRef.current?.click(),
        { disabled: false },
      ),
      clearSvgUseText: button(
        () => {
          setField('importedSvgMarkup', null)
          setField('liquidSourceMode', 'text')
        },
        { disabled: liquidSourceMode !== 'svg' },
      ),
    },
    [setField, liquidSourceMode, text],
  )

  useControls(
    'Typography',
    {
      fontPreset: {
        value: fontPreset,
        options: fontPresetOptions,
        label: 'font family',
        onChange: (v) => setField('fontPreset', v),
        disabled: liquidSourceMode === 'svg',
      },
      fontSize: {
        value: fontSize,
        min: 32,
        max: 160,
        step: 1,
        onChange: (v) => setField('fontSize', v),
      },
      fontWeight: {
        value: fontWeight,
        options: fontWeights,
        onChange: (v) => setField('fontWeight', v),
        disabled: liquidSourceMode === 'svg',
      },
      letterSpacing: {
        value: letterSpacing,
        min: -0.12,
        max: 0.2,
        step: 0.005,
        onChange: (v) => setField('letterSpacing', v),
        disabled: liquidSourceMode === 'svg',
      },
    },
    [setField, liquidSourceMode, fontPreset, fontSize, fontWeight, letterSpacing],
  )

  useControls(
    'Liquid',
    {
      reaction: {
        value: s.reaction,
        min: 0,
        max: 0.45,
        step: 0.005,
        label: 'cursor reaction',
        onChange: (v) => setField('reaction', v),
      },
      glow: {
        value: s.glow,
        min: 0,
        max: 1.2,
        step: 0.01,
        label: 'refraction / glow',
        onChange: (v) => setField('glow', v),
      },
      glowTintPreset: {
        value: s.glowTintPreset,
        options: glowTintOptions,
        label: 'glow tint (preset)',
        onChange: (v) => setField('glowTintPreset', v),
      },
      breeze: {
        value: s.breeze,
        min: 0,
        max: 0.4,
        step: 0.005,
        label: 'breeze (soft drift)',
        onChange: (v) => setField('breeze', v),
      },
      textScrollStretchPosition: {
        value: s.textScrollStretchPosition,
        options: [...textScrollStretchOptions],
        label: 'scroll stretch anchor',
        hint: 'Wheel/trackpad over the full-screen type (not this panel). Bottom: scroll down → stretch up.',
        onChange: (v) => setField('textScrollStretchPosition', v),
      },
    },
    [setField],
  )

  return (
    <input
      ref={svgFileInputRef}
      type="file"
      accept=".svg,image/svg+xml"
      style={{ display: 'none' }}
      aria-hidden
      tabIndex={-1}
      onChange={onSvgSelected}
    />
  )
}
