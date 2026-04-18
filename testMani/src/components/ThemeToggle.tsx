import { useFooterStore } from '../state/footerControls'

export function ThemeToggle() {
  const isDarkMode = useFooterStore((s) => s.isDarkMode)
  const toggleDarkMode = useFooterStore((s) => s.toggleDarkMode)

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => toggleDarkMode()}
      aria-pressed={isDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Light mode' : 'Dark mode'}
    >
      <span className="theme-toggle__track" data-dark={isDarkMode}>
        <span className="theme-toggle__thumb" />
      </span>
      <span className="theme-toggle__label">{isDarkMode ? 'Dark' : 'Light'}</span>
    </button>
  )
}
