import { useState } from 'react'
import { useNav } from '../context/NavContext'
import { useAuth } from '../context/AuthContext'
import type { Screen } from '../types'

export default function LoginScreen() {
  const { navigate, goBack } = useNav()
  const { signIn, isLoading, error } = useAuth()

  const pendingRole = (sessionStorage.getItem('rn_pending_role') ?? 'asha') as
    | 'asha'
    | 'admin'

  const targetScreen: Screen =
    pendingRole === 'admin' ? 'admin-dashboard' : 'asha-dashboard'

  const isAsha = pendingRole === 'asha'

  const accentBg = isAsha ? 'bg-terra' : 'bg-blue-600'
  const accentBorder = isAsha ? 'border-terra' : 'border-blue-600'
  const accentText = isAsha ? 'text-terra' : 'text-blue-600'
  const headerBg = isAsha ? 'bg-terra' : 'bg-blue-700'
  const icon = isAsha ? '👩‍⚕️' : '🏥'
  const roleLabel = isAsha ? 'ASHA Worker' : 'PHC Administrator'

  const [mode, setMode] = useState<'login' | 'register'>('login')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [facilityId, setFacilityId] = useState('')

  const [showPass, setShowPass] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    setLocalError(null)
    setSuccessMessage(null)

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    setLocalError(null)
    setSuccessMessage(null)

    if (!name || !phone || !password) {
      setLocalError('Please fill in name, phone number and password.')
      return
    }

    if (phone.length < 10) {
      setLocalError('Please enter a valid 10-digit phone number.')
      return
    }

    if (password.length < 6) {
      setLocalError('Password must contain at least 6 characters.')
      return
    }

    setIsRegistering(true)

    try {
      const registrationData: {
        name: string
        phone_number: string
        password: string
        role: string
        facility_id?: string
      } = {
        name: name.trim(),
        phone_number: phone.trim(),
        password,
        role: isAsha ? 'asha_worker' : 'admin',
      }

      if (facilityId.trim()) {
        registrationData.facility_id = facilityId.trim()
      }

      const response = await fetch(
        'http://127.0.0.1:8000/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.detail || 'Registration failed. Please try again.'
        )
      }

      setSuccessMessage(
        'Registration successful. Signing you in...'
      )

      const loginOk = await signIn(phone.trim(), password)

      if (loginOk) {
        sessionStorage.removeItem('rn_pending_role')
        navigate(targetScreen)
      } else {
        setMode('login')
        setSuccessMessage(
          'Registration successful. Please log in with your new account.'
        )
      }
    } catch (err) {
      console.error('Registration error:', err)

      setLocalError(
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.'
      )
    } finally {
      setIsRegistering(false)
    }
  }

  const handleDemoBypass = () => {
    sessionStorage.removeItem('rn_pending_role')
    navigate(targetScreen)
  }

  return (
    <div className="min-h-full bg-cream overflow-y-auto">

      {/* Header */}
      <div className={`${headerBg} px-5 pt-4 pb-10 text-white`}>
        <button
          onClick={goBack}
          className="text-white/60 mb-4 flex items-center gap-1 text-sm"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl border border-white/25">
            {icon}
          </div>

          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide">
              {mode === 'login' ? 'Sign in as' : 'Register as'}
            </p>

            <h1 className="text-2xl font-bold leading-tight">
              {roleLabel}
            </h1>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="px-5 -mt-5">
        <div className="bg-white rounded-2xl shadow-lg shadow-black/10 p-5 border border-cream-dark">

          {/* Login / Register Toggle */}
          <div className="flex bg-zinc-100 rounded-xl p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setLocalError(null)
                setSuccessMessage(null)
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-white text-zinc-800 shadow-sm'
                  : 'text-zinc-500'
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('register')
                setLocalError(null)
                setSuccessMessage(null)
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mode === 'register'
                  ? 'bg-white text-zinc-800 shadow-sm'
                  : 'text-zinc-500'
              }`}
            >
              Register
            </button>
          </div>

          {mode === 'login' ? (
            /* ================= LOGIN ================= */
            <form
              onSubmit={handleLogin}
              className="flex flex-col gap-4"
            >

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
                  <p className="text-red-600 text-sm">
                    {localError ?? error}
                  </p>
                </div>
              )}

              {/* Success */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <p className="text-green-700 text-sm">
                    {successMessage}
                  </p>
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
                ) : (
                  'Sign In'
                )}
              </button>

            </form>
          ) : (
            /* ================= REGISTER ================= */
            <form
              onSubmit={handleRegister}
              className="flex flex-col gap-4"
            >

              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block uppercase tracking-wide">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-zinc-800 outline-none transition-all focus:border-2 ${accentBorder} focus:ring-0 placeholder-zinc-400`}
                />
              </div>

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
                    placeholder="Create a password"
                    className={`w-full border rounded-xl px-4 py-3 text-sm text-zinc-800 outline-none transition-all focus:border-2 ${accentBorder} pr-11 placeholder-zinc-400`}
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

              {/* Facility ID */}
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block uppercase tracking-wide">
                  Facility ID
                  <span className="normal-case text-zinc-400 font-normal">
                    {' '} (optional)
                  </span>
                </label>

                <input
                  type="text"
                  value={facilityId}
                  onChange={e => setFacilityId(e.target.value)}
                  placeholder="Enter facility ID"
                  className={`w-full border rounded-xl px-4 py-3 text-sm text-zinc-800 outline-none transition-all focus:border-2 ${accentBorder} focus:ring-0 placeholder-zinc-400`}
                />
              </div>

              {/* Error */}
              {localError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-sm">
                    {localError}
                  </p>
                </div>
              )}

              {/* Success */}
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <p className="text-green-700 text-sm">
                    {successMessage}
                  </p>
                </div>
              )}

              {/* Register */}
              <button
                type="submit"
                disabled={isRegistering}
                className={`w-full ${accentBg} text-white rounded-xl py-4 font-bold text-base active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2`}
              >
                {isRegistering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

            </form>
          )}

          {/* Demo Mode */}
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

      {/* Footer */}
      <p className="text-center text-zinc-400 text-[10px] mt-6 px-5 pb-8">
        Credentials are managed by your PHC administrator.
        <br />
        Contact your district health officer if you cannot log in.
      </p>

    </div>
  )
}