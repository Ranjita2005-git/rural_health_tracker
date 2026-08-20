import { useNav } from '../../context/NavContext'

export default function VillagerHome() {
  const { navigate } = useNav()

  return (
    <div className="min-h-full bg-cream overflow-y-auto">
      {/* Header */}
      <div className="bg-forest px-5 pt-4 pb-10 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-green-300 text-xs font-medium">नमस्ते 🙏</p>
            <h1 className="devanagari text-2xl font-bold">रामपुर गाँव</h1>
            <p className="text-green-400 text-xs">Betul District, Madhya Pradesh</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="bg-amber-400 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full">
              ● OFFLINE
            </div>
            <p className="text-green-400 text-[10px]">Last sync: 6h ago</p>
          </div>
        </div>
        <div className="bg-white/10 border border-white/15 rounded-xl px-3 py-2 mt-2">
          <p className="devanagari text-green-100 text-sm">आज आप कैसा महसूस कर रहे हैं?</p>
          <p className="text-green-400 text-xs">How are you feeling today?</p>
        </div>
      </div>

      {/* Main voice card */}
      <div className="px-5 -mt-5">
        <button
          onClick={() => navigate('symptom-input')}
          className="w-full bg-white rounded-2xl shadow-lg shadow-black/10 p-5 text-center border border-cream-dark hover:shadow-xl active:scale-[0.98] transition-all duration-150"
        >
          <div className="w-20 h-20 bg-forest rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </div>
          <p className="devanagari text-xl font-bold text-forest mb-1">अपने लक्षण बताएं</p>
          <p className="text-zinc-500 text-sm mb-3">Speak your symptoms in Hindi</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {['हिंदी', 'বাংলা', 'मराठी', 'English'].map((lang) => (
              <span
                key={lang}
                className="devanagari bg-green-50 text-forest text-[11px] px-2.5 py-0.5 rounded-full border border-green-200 font-medium"
              >
                {lang}
              </span>
            ))}
          </div>
        </button>
      </div>

      {/* Quick actions */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('phc-locator')}
          className="bg-white rounded-xl p-4 border border-cream-dark hover:shadow-md active:scale-[0.97] transition-all text-left"
        >
          <div className="text-2xl mb-2">🏥</div>
          <p className="devanagari font-semibold text-zinc-800 text-sm leading-tight">नजदीकी PHC</p>
          <p className="text-zinc-400 text-xs">Find nearest clinic</p>
          <p className="text-forest text-xs font-bold mt-1.5">2.3 km दूर →</p>
        </button>

        <button
          onClick={() => navigate('symptom-input')}
          className="bg-white rounded-xl p-4 border border-cream-dark hover:shadow-md active:scale-[0.97] transition-all text-left"
        >
          <div className="text-2xl mb-2">📸</div>
          <p className="devanagari font-semibold text-zinc-800 text-sm leading-tight">फ़ोटो से जाँच</p>
          <p className="text-zinc-400 text-xs">Photo diagnosis</p>
          <p className="text-terra text-xs font-bold mt-1.5">रैश, घाव →</p>
        </button>
      </div>

      {/* Outbreak alert */}
      <div className="px-5 mt-4">
        <button
          onClick={() => navigate('outbreak-alert')}
          className="w-full bg-red-50 border-2 border-red-200 rounded-xl p-4 text-left hover:bg-red-100 active:scale-[0.98] transition-all"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">ALERT</span>
                <span className="text-zinc-400 text-[10px]">16 Aug, 7:50 AM</span>
              </div>
              <p className="devanagari font-bold text-red-700 text-sm">वार्ड 3 में सतर्कता</p>
              <p className="text-red-600 text-xs">Possible dengue cluster — 5 cases / 48h</p>
            </div>
            <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Last check */}
      <div className="px-5 mt-4 mb-8">
        <h3 className="devanagari text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">पिछली जाँच • Last Check</h3>
        <button
          onClick={() => navigate('triage-result')}
          className="w-full bg-white rounded-xl p-4 border border-cream-dark hover:shadow-md active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold">✓</span>
            </div>
            <div className="flex-1 text-left">
              <p className="devanagari text-zinc-800 text-sm font-semibold">बुखार और सिरदर्द</p>
              <p className="text-zinc-400 text-xs">Fever &amp; headache — 2 days ago</p>
            </div>
            <div className="bg-green-100 px-2.5 py-1.5 rounded-lg">
              <p className="devanagari text-green-700 text-xs font-bold">घर पर आराम</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
