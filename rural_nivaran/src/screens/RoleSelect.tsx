import { useNav } from '../context/NavContext'
import type { Role } from '../types'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

const roles = [
  {
    id: 'villager' as Role,
    icon: '👨‍👩‍👧',
    borderClass: 'border-forest',
    textClass: 'text-forest',
    bgClass: 'bg-green-50',
    targetScreen: 'villager-home' as const,
  },
  {
    id: 'asha' as Role,
    icon: '👩‍⚕️',
    borderClass: 'border-terra',
    textClass: 'text-terra',
    bgClass: 'bg-orange-50',
    targetScreen: 'asha-dashboard' as const,
  },
  {
    id: 'admin' as Role,
    icon: '🏥',
    borderClass: 'border-blue-600',
    textClass: 'text-blue-600',
    bgClass: 'bg-blue-50',
    targetScreen: 'admin-dashboard' as const,
  },
  
]

export default function RoleSelect() {
  const { navigate, setRole } = useNav()
  const { t,i18n } = useTranslation()
  const [showLanguageSelect, setShowLanguageSelect] = useState(false)
  const handleSelect = (
    role: Role,
    screen: 'villager-home' | 'asha-dashboard' | 'admin-dashboard'
  ) => {
    setRole(role)
    // Villagers choose language first, then go straight to home (no login)
    if (role === 'villager') {
      setShowLanguageSelect(true)
      return
    }
    // ASHA workers and admins authenticate against the backend
    const pendingRole = role === 'admin' ? 'admin' : 'asha'
    sessionStorage.setItem('rn_pending_role', pendingRole)
    navigate('login')
  }
const handleLanguageSelect = async (language: string) => {
  await i18n.changeLanguage(language)

  // Save selected language
  localStorage.setItem('i18nextLng', language)

  setShowLanguageSelect(false)

  navigate('villager-home')
}
  return (
    <div className="min-h-full bg-cream px-5 pt-10 pb-10 overflow-y-auto">

      {/* Branding */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-forest rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-lg">🏥</span>
        </div>

        <div>
          <p className="devanagari font-bold text-forest text-base leading-none">
            {t('roleSelect.appName')}
          </p>

          <p className="text-zinc-400 text-[10px]">
            {t('roleSelect.appNameEnglish')}
          </p>
        </div>
      </div>

      {/* Heading */}
      <h2 className="devanagari text-3xl font-bold text-zinc-800 mb-1">
        {t('roleSelect.question')}
      </h2>

      <p className="text-zinc-500 text-sm mb-7">
        {t('roleSelect.selectRole')}
      </p>

      {/* Roles */}
      <div className="flex flex-col gap-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => handleSelect(role.id, role.targetScreen)}
            className={`w-full text-left rounded-2xl border-2 ${role.borderClass} bg-white overflow-hidden hover:shadow-lg active:scale-[0.97] transition-all duration-150`}
          >
            <div className="flex items-center gap-4 p-4">

              <div
                className={`w-16 h-16 ${role.bgClass} rounded-xl flex items-center justify-center text-3xl flex-shrink-0`}
              >
                {role.icon}
              </div>

              <div className="flex-1 min-w-0">

                <p
                  className={`devanagari font-bold text-lg ${role.textClass} leading-tight`}
                >
                  {t(`roleSelect.roles.${role.id}.title`)}
                </p>

                <p className="text-zinc-400 text-xs font-medium mb-1">
                  {t(`roleSelect.roles.${role.id}.subtitle`)}
                </p>

                <p className="devanagari text-zinc-600 text-sm leading-snug">
                  {t(`roleSelect.roles.${role.id}.description`)}
                </p>

                <p className="text-zinc-400 text-xs">
                  {t(`roleSelect.roles.${role.id}.descriptionEnglish`)}
                </p>

              </div>

              <svg
                className={`w-5 h-5 ${role.textClass} opacity-40 flex-shrink-0`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>

            </div>
          </button>
        ))}
      </div>
      {showLanguageSelect && (
  <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
    <div className="w-full max-w-md bg-white rounded-t-3xl p-6 shadow-2xl">

      <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-5" />

      <h2 className="text-xl font-bold text-zinc-800 text-center">
        Select your language
      </h2>

      <p className="text-sm text-zinc-500 text-center mt-1 mb-5">
        अपनी भाषा चुनें
      </p>

      <div className="flex flex-col gap-3">

        <button
          onClick={() => handleLanguageSelect('en')}
          className="w-full border-2 border-zinc-200 rounded-xl p-4 text-left hover:border-forest hover:bg-green-50 transition-all"
        >
          <p className="font-bold text-zinc-800">
            English
          </p>
          <p className="text-xs text-zinc-400">
            English
          </p>
        </button>

        <button
          onClick={() => handleLanguageSelect('hi')}
          className="w-full border-2 border-zinc-200 rounded-xl p-4 text-left hover:border-forest hover:bg-green-50 transition-all"
        >
          <p className="font-bold text-zinc-800 devanagari">
            हिंदी
          </p>
          <p className="text-xs text-zinc-400">
            Hindi
          </p>
        </button>

        <button
          onClick={() => handleLanguageSelect('mr')}
          className="w-full border-2 border-zinc-200 rounded-xl p-4 text-left hover:border-forest hover:bg-green-50 transition-all"
        >
          <p className="font-bold text-zinc-800 devanagari">
            मराठी
          </p>
          <p className="text-xs text-zinc-400">
            Marathi
          </p>
        </button>

        <button
          onClick={() => handleLanguageSelect('bn')}
          className="w-full border-2 border-zinc-200 rounded-xl p-4 text-left hover:border-forest hover:bg-green-50 transition-all"
        >
          <p className="font-bold text-zinc-800">
            বাংলা
          </p>
          <p className="text-xs text-zinc-400">
            Bengali
          </p>
        </button>

      </div>

      <button
        onClick={() => setShowLanguageSelect(false)}
        className="w-full mt-4 py-3 text-sm text-zinc-400"
      >
        Cancel
      </button>

    </div>
  </div>
)}

      {/* Offline */}
      <div className="mt-7 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
        <span className="text-xl mt-0.5">📡</span>

        <div>
          <p className="devanagari text-amber-800 text-sm font-semibold">
            {t('roleSelect.offlineTitle')}
          </p>

          <p className="text-amber-600 text-xs">
            {t('roleSelect.offlineDescription')}
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-zinc-300 text-[10px] mt-6 leading-relaxed">
        {t('roleSelect.footerOrganization')}
        <br />
        {t('roleSelect.footerSecurity')}
      </p>

    </div>
  )
}