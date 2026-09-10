import { useNav } from '../context/NavContext'
import type { Screen } from '../types'

interface NavItem {
  icon: string
  label: string
  screen: Screen
}

const villagerItems: NavItem[] = [
  { icon: '🏠', label: 'Home', screen: 'villager-home' },
  { icon: '🏥', label: 'PHC', screen: 'phc-locator' },
  { icon: '⚠️', label: 'Alerts', screen: 'outbreak-alert' },
]

const ashaItems: NavItem[] = [
  { icon: '📋', label: 'Dashboard', screen: 'asha-dashboard' },
  { icon: '➕', label: 'Log Visit', screen: 'log-visit' },
  { icon: '⚠️', label: 'Alerts', screen: 'outbreak-alert' },
]

const adminItems: NavItem[] = [
  { icon: '🏥', label: 'PHC', screen: 'admin-dashboard' },
  { icon: '⚠️', label: 'Outbreaks', screen: 'outbreak-alert' },
  { icon: '👥', label: 'Roster', screen: 'admin-dashboard' },
]

export default function BottomNav() {
  const { screen, navigate, role } = useNav()

  const items =
    role === 'asha'
      ? ashaItems
      : role === 'admin'
        ? adminItems
        : villagerItems

  return (
    <div className="flex border-t border-cream-dark bg-white">
      {items.map((item) => {
        const active = screen === item.screen

        return (
          <button
            key={`${item.screen}-${item.icon}`}
            onClick={() => navigate(item.screen)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors active:scale-95 ${
              active ? 'text-forest' : 'text-muted'
            }`}
          >
            <span className="text-xl leading-none">
              {item.icon}
            </span>

            <span className="text-[10px] font-semibold">
              {item.label}
            </span>

            {active && (
              <div className="w-1 h-1 bg-forest rounded-full mt-0.5" />
            )}
          </button>
        )
      })}
    </div>
  )
}