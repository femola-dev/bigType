import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const FONT_STACKS = {
  system: 'system-ui, "Segoe UI", Roboto, sans-serif',
  inter: '"Inter", system-ui, sans-serif',
  georgia: 'Georgia, "Times New Roman", serif',
  playfair: '"Playfair Display", Georgia, serif',
  dmMono: '"DM Mono", ui-monospace, monospace',
} as const

export type FontPreset = keyof typeof FONT_STACKS

export function getFontStack(preset: FontPreset): string {
  return FONT_STACKS[preset]
}

/** Reference-style refraction highlights (cream / warm gold / pale lime) */
export const GLOW_TINT_PRESETS = {
  prism: '#f5ead8',
  warmGold: '#ffcf8a',
  citrusLime: '#e8ed9a',
} as const

export type GlowTintPreset = keyof typeof GLOW_TINT_PRESETS

export function getGlowTintHex(preset: GlowTintPreset): string {
  return GLOW_TINT_PRESETS[preset]
}

/** Where scroll “grips” the text for vertical stretch (opposite scroll direction activates stretch). */
export type TextScrollStretchPosition = 'bottom' | 'top' | 'left' | 'right'

export const TEXT_SCROLL_STRETCH_POSITION_INT: Record<
  TextScrollStretchPosition,
  number
> = {
  bottom: 0,
  top: 1,
  left: 2,
  right: 3,
}

export type LiquidSourceMode = 'text' | 'svg'

export type FooterControlsState = {
  isDarkMode: boolean
  /** Typed string when liquidSourceMode is "text"; still stored when using SVG for fallback. */
  text: string
  /** "text" uses canvas fillText; "svg" uses importedSvgMarkup rasterized to a texture. */
  liquidSourceMode: LiquidSourceMode
  /** Raw SVG file contents; not persisted (clears on reload). */
  importedSvgMarkup: string | null
  fontSize: number
  fontWeight: string
  fontPreset: FontPreset
  letterSpacing: number
  /** Anchor for wheel-driven vertical stretch (see TextScrollStretchPosition). */
  textScrollStretchPosition: TextScrollStretchPosition
  reaction: number
  glow: number
  glowTintPreset: GlowTintPreset
  breeze: number
  setField: <K extends keyof Omit<FooterControlsState, 'setField'>>(
    key: K,
    value: FooterControlsState[K],
  ) => void
  toggleDarkMode: () => void
}

type LegacyRaw = Record<string, unknown>

function mergePersisted(
  persisted: unknown,
  current: FooterControlsState,
): FooterControlsState {
  const raw = { ...(persisted as LegacyRaw) }
  const legacyTheme = raw.themeMode
  const legacyStrength = raw.strength
  const legacyReact = raw.react

  const strip = [
    'themeMode',
    'lightBackground',
    'lightText',
    'darkBackground',
    'darkText',
    'baseColor',
    'backgroundColor',
    'pull',
    'react',
    'merge',
    'swirl',
    'radius',
    'falloff',
    'viscosity',
    'glowPower',
    'glowSpecular',
    'glowColor',
    'glowColorDark',
    'glowColorLight',
    'lightDirX',
    'lightDirY',
    'chromatic',
    'chromaticAngle',
    'strength',
  ] as const
  for (const k of strip) {
    delete raw[k]
  }

  if (typeof raw.isDarkMode !== 'boolean') {
    if (legacyTheme === 'dark') raw.isDarkMode = true
    else if (legacyTheme === 'light') raw.isDarkMode = false
    else raw.isDarkMode = false
  }

  if (typeof raw.reaction !== 'number' && typeof legacyStrength === 'number') {
    raw.reaction = legacyStrength
  }

  if (raw.glowTintPreset === undefined) {
    raw.glowTintPreset = 'prism'
  }

  const stretchPos = raw.textScrollStretchPosition
  if (
    stretchPos !== undefined &&
    stretchPos !== 'bottom' &&
    stretchPos !== 'top' &&
    stretchPos !== 'left' &&
    stretchPos !== 'right'
  ) {
    raw.textScrollStretchPosition = 'bottom'
  }

  if (typeof raw.breeze !== 'number' && typeof legacyReact === 'number') {
    raw.breeze = Math.min(0.35, legacyReact * 0.45)
  }

  const mode = raw.liquidSourceMode
  if (mode !== 'text' && mode !== 'svg') {
    raw.liquidSourceMode = 'text'
  }

  const merged = { ...current, ...raw } as FooterControlsState
  if (
    merged.liquidSourceMode === 'svg' &&
    (!merged.importedSvgMarkup || !merged.importedSvgMarkup.trim())
  ) {
    merged.liquidSourceMode = 'text'
  }
  return merged
}

export const useFooterStore = create<FooterControlsState>()(
  persist(
    (set) => ({
      isDarkMode: true,
      text: 'YOUR NAME',
      liquidSourceMode: 'text',
      importedSvgMarkup: null,
      fontSize: 96,
      fontWeight: '800',
      fontPreset: 'playfair',
      letterSpacing: -0.04,
      textScrollStretchPosition: 'bottom',
      reaction: 0.16,
      glow: 0.48,
      glowTintPreset: 'prism',
      breeze: 0.14,
      setField: (key, value) => set({ [key]: value } as Partial<FooterControlsState>),
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
    }),
    {
      name: 'portfolio-footer-controls',
      merge: (persisted, current) => mergePersisted(persisted, current),
      partialize: (s) => ({
        isDarkMode: s.isDarkMode,
        text: s.text,
        liquidSourceMode: s.liquidSourceMode,
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        fontPreset: s.fontPreset,
        letterSpacing: s.letterSpacing,
        textScrollStretchPosition: s.textScrollStretchPosition,
        reaction: s.reaction,
        glow: s.glow,
        glowTintPreset: s.glowTintPreset,
        breeze: s.breeze,
      }),
    },
  ),
)
