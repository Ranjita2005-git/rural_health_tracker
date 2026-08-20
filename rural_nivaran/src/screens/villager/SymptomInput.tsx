import { useState, useEffect } from 'react'
import { useNav } from '../../context/NavContext'

const TRANSCRIPT_STEPS = [
  '',
  'मुझे...',
  'मुझे तीन दिन से...',
  'मुझे तीन दिन से बुखार है,',
  'मुझे तीन दिन से बुखार है, सिर में दर्द है',
  'मुझे तीन दिन से बुखार है, सिर में दर्द है और उल्टी जैसा लग रहा है।',
]

type Phase = 'idle' | 'recording' | 'analyzing'

export default function SymptomInput() {
  const { navigate, goBack } = useNav()
  const [phase, setPhase] = useState<Phase>('idle')
  const [transcriptIdx, setTranscriptIdx] = useState(0)

  useEffect(() => {
    if (phase === 'recording') {
      let i = 0
      const t = setInterval(() => {
        i++
        setTranscriptIdx(i)
        if (i >= TRANSCRIPT_STEPS.length - 1) clearInterval(t)
      }, 600)
      return () => clearInterval(t)
    }
    if (phase === 'analyzing') {
      const t = setTimeout(() => navigate('triage-result'), 2200)
      return () => clearTimeout(t)
    }
  }, [phase])

  const handleMicPress = () => {
    if (phase === 'idle') setPhase('recording')
    else if (phase === 'recording') setPhase('analyzing')
  }

  return (
    <div className="h-full bg-forest flex flex-col pt-8">
      {/* Header */}
      <div className="flex items-center px-5 pt-2 pb-4">
        <button onClick={goBack} className="text-green-300 mr-3 p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="devanagari text-white font-bold text-xl leading-tight">
            {phase === 'analyzing' ? 'विश्लेषण हो रहा है...' : 'लक्षण बताएं'}
          </h2>
          <p className="text-green-400 text-xs">
            {phase === 'analyzing' ? 'Analyzing symptoms...' : 'Speak your symptoms'}
          </p>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {phase === 'analyzing' ? (
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 border-4 border-green-600 border-t-white rounded-full animate-spin" />
            <div className="text-center">
              <p className="devanagari text-white text-2xl font-bold mb-1">जाँच हो रही है</p>
              <p className="text-green-300 text-sm">Rule-based triage — no internet needed</p>
            </div>
            <div className="flex gap-1.5 mt-2">
              {['बुखार', 'सिरदर्द', 'मतली'].map((s) => (
                <span key={s} className="devanagari bg-white/10 text-green-200 text-xs px-2 py-1 rounded-lg border border-white/15">
                  {s}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Mic button with ripple */}
            <div className="relative flex items-center justify-center mb-10">
              {phase === 'recording' && (
                <>
                  <div className="absolute w-44 h-44 bg-white/8 rounded-full animate-ping" />
                  <div className="absolute w-36 h-36 bg-white/12 rounded-full animate-ping" style={{ animationDelay: '300ms' }} />
                </>
              )}
              <button
                onClick={handleMicPress}
                className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-200 shadow-2xl active:scale-95 ${
                  phase === 'recording' ? 'bg-red-500 scale-110' : 'bg-white'
                }`}
              >
                {phase === 'recording' ? (
                  <div className="w-11 h-11 bg-white rounded-lg" />
                ) : (
                  <svg className="w-16 h-16 text-forest" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                )}
              </button>
            </div>

            <p className="devanagari text-white text-2xl font-bold text-center mb-2">
              {phase === 'idle' ? 'दबाएं और बोलें' : 'सुन रहा हूँ...'}
            </p>
            <p className="text-green-300 text-sm text-center">
              {phase === 'idle' ? 'Tap the mic to start speaking' : 'Tap again to stop recording'}
            </p>
          </>
        )}
      </div>

      {/* Transcript bubble */}
      {(phase === 'recording' || phase === 'analyzing') && (
        <div className="mx-5 mb-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/15">
          <p className="text-green-300 text-[10px] font-bold uppercase tracking-wider mb-2">📝 TRANSCRIBING — HINDI</p>
          <p className="devanagari text-white text-base leading-relaxed min-h-12">
            {TRANSCRIPT_STEPS[transcriptIdx]}
            {phase === 'recording' && (
              <span className="inline-block w-0.5 h-4 bg-green-300 ml-0.5 animate-pulse align-middle" />
            )}
          </p>
        </div>
      )}

      {/* Language selector & photo option */}
      {phase === 'idle' && (
        <>
          <div className="flex justify-center gap-2 mb-4 flex-wrap px-5">
            {['हिंदी ✓', 'বাংলা', 'मराठी', 'English'].map((lang, i) => (
              <span
                key={lang}
                className={`devanagari text-xs px-3 py-1 rounded-full border font-medium ${
                  i === 0
                    ? 'bg-white text-forest border-white'
                    : 'text-green-300 border-green-700'
                }`}
              >
                {lang}
              </span>
            ))}
          </div>
          <div className="mx-5 mb-8">
            <button className="w-full border-2 border-dashed border-green-700 rounded-xl p-3 flex items-center gap-3 hover:border-green-500 active:scale-[0.98] transition-all">
              <span className="text-2xl">📸</span>
              <div className="text-left">
                <p className="devanagari text-green-100 text-sm font-semibold">फ़ोटो भी जोड़ें</p>
                <p className="text-green-500 text-xs">Add photo of rash, wound, or eye</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
