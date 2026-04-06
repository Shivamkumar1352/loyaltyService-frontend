import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../../store'

export function ThemeToggle() {
  const { isDark, toggle } = useThemeStore()

  return (
    <button
      onClick={toggle}
      className="btn-ghost rounded-xl p-2"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}
