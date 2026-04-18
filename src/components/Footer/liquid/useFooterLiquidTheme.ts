/**
 * Fixed dark palette for the footer brand band — does not alter document color-scheme
 * so the rest of the page stays light-themed.
 */
const FOOTER_LIQUID_THEME = {
  background: '#000000',
  text: '#f5f0e8',
  scheme: 'dark' as const,
}

export function useFooterLiquidTheme() {
  return FOOTER_LIQUID_THEME
}
