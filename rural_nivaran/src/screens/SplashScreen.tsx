import { useEffect, useState } from 'react'
import { useNav } from '../context/NavContext'

export default function SplashScreen() {
  const { navigate } = useNav()
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800)
    const t2 = setTimeout(() => setPhase(2), 2200)
    const t3 = setTimeout(() => navigate('role-select'), 3400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-forest text-white px-8 pt-8 select-none">
      {/* Logo */}
      <div
        className="transition-all duration-700"
        style={{ opacity: phase >= 0 ? 1 : 0, transform: phase >= 0 ? 'none' : 'translateY(20px)' }}
      >
        <div className="w-28 h-28 bg-white/15 rounded-3xl flex items-center justify-center mb-6 border border-white/25 shadow-xl">
          <div className="text-6xl">🏥</div>
        </div>
      </div>

      <div
        className="text-center transition-all duration-700 delay-300"
        style={{ opacity: phase >= 0 ? 1 : 0, transform: phase >= 0 ? 'none' : 'translateY(16px)' }}
      >
        <h1 className="devanagari text-4xl font-bold mb-1 tracking-tight">Nivaran</h1>
        <p className="text-green-300 text-xs font-semibold tracking-widest uppercase">Right care, right time, right place</p>
      </div>

      <div
        className="mt-5 text-center transition-all duration-700"
        style={{ opacity: phase >= 1 ? 1 : 0 }}
      >
        <p className="devanagari text-green-100 text-base">तुमचे आरोग्य, तुमच्या भाषेत</p>
        <p className="text-green-400 text-xs mt-1">Your health, in your language</p>
      </div>

      <div
        className="mt-14 flex flex-col items-center gap-3 transition-all duration-700"
        style={{ opacity: phase >= 1 ? 1 : 0 }}
      >
        <div className="flex gap-2 items-center">
          <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="devanagari text-green-200 text-sm">
          {phase >= 2 ? '✓ हिंदी भाषा पहचानी गई' : 'भाषा पहचान हो रही है...'}
        </p>
      </div>

      <div className="absolute bottom-16 text-center">
        <p className="text-green-500 text-[10px] font-semibold tracking-widest uppercase">
          National Health Mission
        </p>
        <p className="text-green-600 text-[10px] mt-0.5">Ministry of Maharastra &amp; Family Welfare</p>
      </div>
    </div>
  )
}
