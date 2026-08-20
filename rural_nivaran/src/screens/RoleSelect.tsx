import { useNav } from '../context/NavContext'
import type { Role } from '../types'

const roles = [
  {
    id: 'villager' as Role,
    icon: '👨‍👩‍👧',
    title: 'गाँव के लोग',
    subtitle: 'Villager',
    desc: 'लक्षण बताएं, नजदीकी PHC खोजें',
    descEn: 'Describe symptoms, find nearby clinic',
    borderClass: 'border-forest',
    textClass: 'text-forest',
    bgClass: 'bg-green-50',
    dotClass: 'bg-forest',
    targetScreen: 'villager-home' as const,
  },
  {
    id: 'asha' as Role,
    icon: '👩‍⚕️',
    title: 'ASHA कार्यकर्ता',
    subtitle: 'ASHA Worker',
    desc: 'घर भेंट लॉग करें, रिपोर्ट बनाएं',
    descEn: 'Log visits, generate PHC reports',
    borderClass: 'border-terra',
    textClass: 'text-terra',
    bgClass: 'bg-orange-50',
    dotClass: 'bg-terra',
    targetScreen: 'asha-dashboard' as const,
  },
  {
    id: 'admin' as Role,
    icon: '🏥',
    title: 'PHC प्रशासक',
    subtitle: 'PHC Admin',
    desc: 'डॉक्टर उपलब्धता प्रबंधित करें',
    descEn: 'Manage doctor availability & referrals',
    borderClass: 'border-blue-600',
    textClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    dotClass: 'bg-blue-600',
    targetScreen: 'admin-dashboard' as const,
  },
]

export default function RoleSelect() {
  const { navigate, setRole } = useNav()

  const handleSelect = (role: Role, screen: 'villager-home' | 'asha-dashboard' | 'admin-dashboard') => {
    setRole(role)
    navigate(screen)
  }

  return (
    <div className="min-h-full bg-cream px-5 pt-10 pb-10 overflow-y-auto">
      {/* Branding */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-forest rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-lg">🏥</span>
        </div>
        <div>
          <p className="devanagari font-bold text-forest text-base leading-none">स्वास्थ्य सहायक</p>
          <p className="text-zinc-400 text-[10px]">Swasthya Sahayak</p>
        </div>
      </div>

      <h2 className="devanagari text-3xl font-bold text-zinc-800 mb-1">आप कौन हैं?</h2>
      <p className="text-zinc-500 text-sm mb-7">Select your role to continue</p>

      <div className="flex flex-col gap-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => handleSelect(role.id, role.targetScreen)}
            className={`w-full text-left rounded-2xl border-2 ${role.borderClass} bg-white overflow-hidden hover:shadow-lg active:scale-[0.97] transition-all duration-150`}
          >
            <div className="flex items-center gap-4 p-4">
              <div className={`w-16 h-16 ${role.bgClass} rounded-xl flex items-center justify-center text-3xl flex-shrink-0`}>
                {role.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`devanagari font-bold text-lg ${role.textClass} leading-tight`}>{role.title}</p>
                <p className="text-zinc-400 text-xs font-medium mb-1">{role.subtitle}</p>
                <p className="devanagari text-zinc-600 text-sm leading-snug">{role.desc}</p>
                <p className="text-zinc-400 text-xs">{role.descEn}</p>
              </div>
              <svg className={`w-5 h-5 ${role.textClass} opacity-40 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-7 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
        <span className="text-xl mt-0.5">📡</span>
        <div>
          <p className="devanagari text-amber-800 text-sm font-semibold">ऑफ़लाइन मोड उपलब्ध</p>
          <p className="text-amber-600 text-xs">Works without internet — data syncs automatically when connected</p>
        </div>
      </div>

      <p className="text-center text-zinc-300 text-[10px] mt-6 leading-relaxed">
        National Health Mission, Government of India<br />
        सभी डेटा आपके फ़ोन पर सुरक्षित रहता है
      </p>
    </div>
  )
}
