import { useEffect } from 'react'
import { useFooterStore } from '../state/footerControls'

const PALETTE = {
  dark: { background: '#0a0a0c', text: '#f5f0e8' },
  light: { background: '#f0ede8', text: '#14141a' },
} as const

export function useEffectiveTheme() {
  const isDarkMode = useFooterStore((s) => s.isDarkMode)
  const scheme: 'light' | 'dark' = isDarkMode ? 'dark' : 'light'
  const { background, text } = PALETTE[scheme]

  useEffect(() => {
    document.documentElement.style.colorScheme = scheme
  }, [scheme])

  return {
    background,
    text,
    scheme,
    isDarkMode,
  }
}
