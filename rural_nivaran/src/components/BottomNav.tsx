import { useNav } from '../context/NavContext'
import type { Screen } from '../types'

interface NavItem {
  icon: string
  labelHi: string
  screen: Screen
}

const villagerItems: NavItem[] = [
  { icon: '🏠', labelHi: 'होम', screen: 'villager-home' },
  { icon: '🏥', labelHi: 'PHC', screen: 'phc-locator' },
  { icon: '⚠️', labelHi: 'अलर्ट', screen: 'outbreak-alert' },
]

const ashaItems: NavItem[] = [
  { icon: '📋', labelHi: 'डैशबोर्ड', screen: 'asha-dashboard' },
  { icon: '➕', labelHi: 'भेंट लॉग', screen: 'log-visit' },
  { icon: '⚠️', labelHi: 'अलर्ट', screen: 'outbreak-alert' },
]

const adminItems: NavItem[] = [
  { icon: '🏥', labelHi: 'PHC', screen: 'admin-dashboard' },
  { icon: '⚠️', labelHi: 'प्रकोप', screen: 'outbreak-alert' },
  { icon: '👥', labelHi: 'रोस्टर', screen: 'admin-dashboard' },
]

export default function BottomNav() {
  const { screen, navigate, role } = useNav()

  const items =
    role === 'asha' ? ashaItems : role === 'admin' ? adminItems : villagerItems

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
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="devanagari text-[10px] font-semibold">{item.labelHi}</span>
            {active && (
              <div className="w-1 h-1 bg-forest rounded-full mt-0.5" />
            )}
          </button>
        )
      })}
    </div>
  )
}
