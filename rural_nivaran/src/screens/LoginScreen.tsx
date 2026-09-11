import { useState } from 'react'
import { useNav } from '../context/NavContext'
import { useAuth } from '../context/AuthContext'
import type { Screen } from '../types'

/**
 * Login screen used by ASHA workers and PHC Admins.
 * On success the JWT is stored via AuthContext and the user is forwarded to
 * the correct dashboard.  If the backend is unreachable a clear message is
 * shown and the user can still continue in demo-mode by tapping the bypass.
 */
export default function LoginScreen() {
  const { navigate, goBack } = useNav()
  const { signIn, isLoading, error } = useAuth()

  // The pending role/destination is encoded in the URL-like nav state via a
  // simple context-less approach: we read it from sessionStorage where
  // RoleSelect.tsx writes it before navigating here.
  const pendingRole = (sessionStorage.getItem('rn_pending_role') ?? 'asha') as
    | 'asha'
    | 'admin'
  const targetScreen: Screen =
    pendingRole === 'admin' ? 'admin-dashboard' : 'asha-dashboard'

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const isAsha = pendingRole === 'asha'
  const accentBg = isAsha ? 'bg-terra' : 'bg-blue-600'
  const accentBorder = isAsha ? 'border-terra' : 'border-blue-600'
  const accentText = isAsha ? 'text-terra' : 'text-blue-600'
  const headerBg = isAsha ? 'bg-terra' : 'bg-blue-700'
  const icon = isAsha ? '👩‍⚕️' : '🏥'
  const roleLabel = isAsha ? 'ASHA Worker' : 'PHC Administrator'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!phone || !password) {
      setLocalError('Please enter your phone number and password.')
      return
    }

    const ok = await signIn(phone, password)
    if (ok) {
      sessionStorage.removeItem('rn_pending_role')
      navigate(targetScreen)
    }
  }

  /** Let the user skip login for demo purposes when the backend is down */
  const handleDemoBypass = () => {
    sessionStorage.removeItem('rn_pending_role')
    navigate(targetScreen)
  }

  return (
    <div className="min-h-full bg-cream overflow-y-auto">

      {/* ── Header ── */}
      <div className={`${headerBg} px-5 pt-4 pb-10 text-white`}>
        <button
          onClick={goBack}
          className="text-white/60 mb-4 flex items-center gap-1 text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl border border-white/25">
            {icon}
          </div>
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Sign in as</p>
            <h1 className="text-2xl font-bold leading-tight">{roleLabel}</h1>
          </div>
        </div>
      </div>

      {/* ── Card ── */}
      <div className="px-5 -mt-5">
        <div className="bg-white rounded-2xl shadow-lg shadow-black/10 p-5 border border-cream-dark">

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1.5 block uppercase tracking-wide">
                Phone Number
              </label>
              <input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className={`w-full border rounded-xl px-4 py-3 text-sm text-zinc-800 outline-none transition-all focus:border-2 ${accentBorder} focus:ring-0 placeholder-zinc-400`}
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1.5 block uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-zinc-800 outline-none transition-all focus:border-2 ${accentBorder} pr-11 placeholder-zinc-400`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-medium"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Error */}
            {(error || localError) && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{localError ?? error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${accentBg} text-white rounded-xl py-4 font-bold text-base active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>

          </form>

          {/* Offline / demo bypass */}
          <div className="mt-4 pt-4 border-t border-zinc-100">
            <p className="text-zinc-400 text-xs text-center mb-2">
              Backend unavailable? Use demo mode.
            </p>
            <button
              onClick={handleDemoBypass}
              className={`w-full border ${accentBorder} ${accentText} rounded-xl py-3 text-sm font-semibold active:scale-[0.98] transition-all hover:bg-zinc-50`}
            >
              📴 Continue without login (Demo)
            </button>
          </div>

        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-zinc-400 text-[10px] mt-6 px-5 pb-8">
        Credentials are managed by your PHC administrator.
        <br />
        Contact your district health officer if you cannot log in.
      </p>

    </div>
  )
}
