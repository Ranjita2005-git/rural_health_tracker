import type { ReactNode } from 'react'
import StatusBar from './StatusBar'
import BottomNav from './BottomNav'
import { useNav } from '../context/NavContext'

const DARK_STATUS: string[] = ['villager-home', 'phc-locator']
const NO_STATUS: string[] = ['splash']
const NO_NAV: string[] = ['splash', 'role-select', 'symptom-input']

export default function MobileShell({ children }: { children: ReactNode }) {
  const { screen, role } = useNav()

  const showStatus = !NO_STATUS.includes(screen)
  const showNav = role !== null && !NO_NAV.includes(screen)
  const darkStatus = DARK_STATUS.includes(screen)

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center py-6 px-4">
      <div
        className="relative flex flex-col overflow-hidden bg-cream"
        style={{
          width: '390px',
          height: '844px',
          borderRadius: '44px',
          boxShadow: '0 0 0 10px #1a1a1a, 0 0 0 12px #333, 0 40px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Notch */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 bg-zinc-900 z-50"
          style={{
            width: '120px',
            height: '28px',
            borderRadius: '0 0 20px 20px',
          }}
        />

        {/* Status bar */}
        {showStatus && (
          <div className={`pt-8 ${darkStatus ? '' : ''}`}>
            <StatusBar isOffline dark={darkStatus} />
          </div>
        )}

        {/* Screen content */}
        <div className={`flex-1 overflow-y-auto ${!showStatus ? 'pt-0' : ''}`}>
          {children}
        </div>

        {/* Bottom nav */}
        {showNav && <BottomNav />}

        {/* Home indicator */}
        <div className="flex justify-center py-2 bg-white">
          <div className="w-28 h-1 bg-zinc-200 rounded-full" />
        </div>
      </div>
    </div>
  )
}
