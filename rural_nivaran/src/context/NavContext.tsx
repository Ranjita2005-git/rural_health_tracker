import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Screen, Role } from '../types'

interface NavContextType {
  screen: Screen
  navigate: (screen: Screen) => void
  goBack: () => void
  role: Role | null
  setRole: (role: Role) => void
}

const NavContext = createContext<NavContextType | null>(null)

export function NavProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>('splash')
  const [history, setHistory] = useState<Screen[]>([])
  const [role, setRole] = useState<Role | null>(null)

  const navigate = (newScreen: Screen) => {
    setHistory(h => [...h, screen])
    setScreen(newScreen)
  }

  const goBack = () => {
    const prev = history[history.length - 1]
    if (prev) {
      setHistory(h => h.slice(0, -1))
      setScreen(prev)
    }
  }

  return (
    <NavContext.Provider value={{ screen, navigate, goBack, role, setRole }}>
      {children}
    </NavContext.Provider>
  )
}

export function useNav() {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNav must be used within NavProvider')
  return ctx
}
