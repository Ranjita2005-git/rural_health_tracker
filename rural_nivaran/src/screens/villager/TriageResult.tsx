import { useState } from 'react'
import { useNav } from '../../context/NavContext'

type Level = 'home' | 'phc' | 'urgent'

const RESULTS = {
  home: {
    emoji: '🏠',
    levelHi: 'घर पर उपचार करें',
    levelEn: 'Home Care',
    headerBg: 'bg-emerald-600',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeLabel: 'कोई आपात स्थिति नहीं',
    stepBg: 'bg-emerald-50',
    stepBorder: 'border-emerald-200',
    stepNumBg: 'bg-emerald-600',
    stepText: 'text-emerald-800',
    titleHi: 'घर पर यह करें',
    steps: [
      { hi: 'पर्याप्त पानी और ORS घोल पीएं', en: 'Drink water and ORS solution frequently' },
      { hi: 'बुखार के लिए पैरासिटामोल 500mg लें', en: 'Take paracetamol 500mg for fever' },
      { hi: '2-3 दिन आराम करें, बाहर न जाएं', en: 'Rest for 2-3 days, avoid going out' },
      { hi: '3 दिन में ठीक न हो तो PHC जाएं', en: 'If no improvement in 3 days, visit PHC' },
    ],
  },
  phc: {
    emoji: '🏥',
    levelHi: 'PHC जाएं',
    levelEn: 'Visit PHC Today',
    headerBg: 'bg-amber-500',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    badgeLabel: 'डॉक्टर से परामर्श जरूरी',
    stepBg: 'bg-amber-50',
    stepBorder: 'border-amber-200',
    stepNumBg: 'bg-amber-500',
    stepText: 'text-amber-800',
    titleHi: '24 घंटे के अंदर डॉक्टर से मिलें',
    steps: [
      { hi: 'नजदीकी PHC में आज जाएं', en: 'Visit the nearest PHC today' },
      { hi: 'यह ऐप की स्क्रीन डॉक्टर को दिखाएं', en: 'Show this screen to the doctor' },
      { hi: 'अपनी दवाएं और कार्ड साथ लाएं', en: 'Bring your existing medicines and health card' },
      { hi: 'खाना खाकर जाएं', en: 'Eat before you go' },
    ],
  },
  urgent: {
    emoji: '🚨',
    levelHi: 'तुरंत अस्पताल जाएं',
    levelEn: 'Emergency — Go Now',
    headerBg: 'bg-red-600',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-800',
    badgeLabel: '⚡ आपातकाल — अभी जाएं',
    stepBg: 'bg-red-50',
    stepBorder: 'border-red-200',
    stepNumBg: 'bg-red-600',
    stepText: 'text-red-800',
    titleHi: 'यह आपात स्थिति हो सकती है',
    steps: [
      { hi: 'अभी जिला अस्पताल बैतूल जाएं', en: 'Go to District Hospital Betul immediately' },
      { hi: 'किसी परिवार के सदस्य को साथ ले जाएं', en: 'Take a family member with you' },
      { hi: 'अपनी ASHA कार्यकर्ता को फ़ोन करें', en: 'Call your ASHA worker now' },
      { hi: '108 एम्बुलेंस बुलाएं — मुफ़्त है', en: 'Call 108 for free ambulance service' },
    ],
  },
}

export default function TriageResult() {
  const { navigate, goBack } = useNav()
  const [level, setLevel] = useState<Level>('home')
  const r = RESULTS[level]

  return (
    <div className="min-h-full bg-cream overflow-y-auto">
      {/* Header */}
      <div className={`${r.headerBg} px-5 pt-6 pb-7 text-white`}>
        <button onClick={goBack} className="text-white/60 mb-4 flex items-center gap-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back</span>
        </button>
        <div className="flex items-center gap-4 mb-3">
          <span className="text-5xl">{r.emoji}</span>
          <div>
            <p className="devanagari text-2xl font-bold leading-tight">{r.levelHi}</p>
            <p className="text-white/70 text-sm">{r.levelEn}</p>
          </div>
        </div>
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${r.badgeBg}`}>
          <p className={`devanagari text-xs font-bold ${r.badgeText}`}>{r.badgeLabel}</p>
        </div>
      </div>

      {/* Demo level switcher */}
      <div className="flex gap-2 px-5 mt-4">
        {(['home', 'phc', 'urgent'] as Level[]).map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`flex-1 text-xs py-2 rounded-xl font-semibold transition-all ${
              level === l ? 'bg-zinc-800 text-white shadow' : 'bg-white text-zinc-400 border border-zinc-200'
            }`}
          >
            {l === 'home' ? '🏠 Home' : l === 'phc' ? '🏥 PHC' : '🚨 Urgent'}
          </button>
        ))}
      </div>

      {/* Detected symptoms */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-xl p-4 border border-cream-dark">
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wide mb-2">आपके लक्षण • Detected Symptoms</p>
          <p className="devanagari text-zinc-700 text-sm leading-relaxed italic">
            "मुझे तीन दिन से बुखार है, सिर में दर्द है और उल्टी जैसा लग रहा है।"
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {['बुखार 3 दिन', 'सिरदर्द', 'मतली'].map((s) => (
              <span key={s} className="devanagari bg-zinc-100 text-zinc-600 text-xs px-2.5 py-1 rounded-lg font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="px-5 mt-4">
        <p className={`devanagari font-bold text-base ${r.stepText} mb-3`}>{r.titleHi}</p>
        <div className="flex flex-col gap-2">
          {r.steps.map((step, i) => (
            <div key={i} className={`${r.stepBg} border ${r.stepBorder} rounded-xl p-3 flex gap-3 items-start`}>
              <div className={`w-6 h-6 ${r.stepNumBg} text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5`}>
                {i + 1}
              </div>
              <div>
                <p className={`devanagari ${r.stepText} text-sm font-semibold`}>{step.hi}</p>
                <p className="text-zinc-500 text-xs">{step.en}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 mt-5 mb-8 flex flex-col gap-3">
        <button
          onClick={() => navigate('phc-locator')}
          className="w-full bg-forest text-white rounded-xl py-4 font-bold devanagari text-base flex items-center justify-center gap-2 hover:bg-forest-dark active:scale-[0.98] transition-all"
        >
          <span>🏥</span> नजदीकी PHC देखें
        </button>
        <p className="text-center text-zinc-400 text-xs">
          Nearest: Rampur PHC — 2.3 km • Dr. Priya Sharma available
        </p>
        <button
          onClick={() => navigate('villager-home')}
          className="w-full bg-white text-zinc-500 border border-zinc-200 rounded-xl py-3 text-sm devanagari hover:bg-zinc-50 active:scale-[0.98] transition-all"
        >
          होम पर वापस जाएं
        </button>
        <p className="text-center text-zinc-400 text-[10px]">
          This advice is based on a rule-based system. When in doubt, always consult a doctor.
        </p>
      </div>
    </div>
  )
}
