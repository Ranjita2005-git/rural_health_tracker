import { useState, useEffect } from 'react'

interface Props {
  isOffline?: boolean
  dark?: boolean
}

export default function StatusBar({ isOffline = true, dark = false }: Props) {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      )
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [])

  const base = dark ? 'text-white/80' : 'text-zinc-600'

  return (
    <div className={`flex items-center justify-between px-5 py-1.5 text-xs font-semibold ${base}`}>
      <span>{time}</span>
      <div className="flex items-center gap-2">
        {isOffline ? (
          <span className="bg-amber-400 text-amber-900 text-[10px] px-1.5 py-0.5 rounded-full font-black">
            OFFLINE
          </span>
        ) : (
          <span className={`text-[10px] ${dark ? 'text-green-300' : 'text-green-600'}`}>● SYNCED</span>
        )}
        <svg className="w-4 h-4 opacity-60" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 2H7C5.9 2 5 2.9 5 4v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 15H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V7h8v2z" />
        </svg>
      </div>
    </div>
  )
}
