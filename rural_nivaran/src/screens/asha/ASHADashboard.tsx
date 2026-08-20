import { useNav } from '../../context/NavContext'
import { households } from '../../data'

export default function ASHADashboard() {
  const { navigate } = useNav()

  const highRisk = households.filter((h) => h.riskLevel === 'high')

  return (
    <div className="min-h-full bg-cream overflow-y-auto">
      {/* Header */}
      <div className="bg-terra px-5 pt-4 pb-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-orange-200 text-xs font-medium">ASHA कार्यकर्ता</p>
            <h1 className="devanagari text-2xl font-bold">ममता देवी</h1>
            <p className="text-orange-300 text-xs">रामपुर सेक्टर, बैतूल</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl border border-white/25">
            👩
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { n: String(households.length), label: 'घर भेंट\nPending', bg: 'bg-white/15' },
            { n: String(highRisk.length), label: 'उच्च जोखिम\nHigh Risk', bg: 'bg-red-600/50' },
            { n: '4', label: 'सिंक बाकी\nPending Sync', bg: 'bg-amber-500/50' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-xl p-2.5 text-center`}>
              <p className="text-2xl font-black text-white">{s.n}</p>
              <p className="text-white/75 text-[10px] whitespace-pre-line leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sync status */}
      <div className="px-5 mt-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
          <span className="text-xl">🔄</span>
          <div className="flex-1">
            <p className="devanagari text-amber-800 text-sm font-bold">4 रिकॉर्ड सिंक बाकी</p>
            <p className="text-amber-600 text-xs">Auto-syncs when phone gets internet</p>
          </div>
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Outbreak alert */}
      <div className="px-5 mt-3">
        <button
          onClick={() => navigate('outbreak-alert')}
          className="w-full bg-red-50 border-2 border-red-300 rounded-xl p-3.5 flex items-center gap-3 text-left hover:bg-red-100 active:scale-[0.98] transition-all"
        >
          <span className="text-2xl">🚨</span>
          <div className="flex-1">
            <p className="devanagari text-red-700 font-bold text-sm">वार्ड 3 — डेंगू क्लस्टर संदेह</p>
            <p className="text-red-500 text-xs">5 मामले · 48 घंटे · बुखार + दाने · Dengue cluster flagged</p>
          </div>
          <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* High risk */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="devanagari font-bold text-zinc-800">उच्च जोखिम परिवार</h3>
          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{highRisk.length} HIGH RISK</span>
        </div>
        <div className="flex flex-col gap-2">
          {highRisk.map((h) => (
            <div
              key={h.id}
              className="bg-white border-l-4 border-red-500 rounded-r-xl p-3 flex items-start gap-3 shadow-sm"
            >
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-xl flex-shrink-0 border border-red-100">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <p className="devanagari font-bold text-zinc-800 text-sm">{h.headNameHi}</p>
                <p className="text-zinc-400 text-xs">{h.village} · {h.members} सदस्य</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {h.tags.map((tag) => (
                    <span key={tag} className="devanagari bg-red-50 text-red-600 text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-zinc-400 text-[10px]">Last visit</p>
                <p className="text-zinc-600 text-xs font-semibold">{h.lastVisit.slice(5).replace('-', '/')}</p>
                <p className="text-red-500 text-[10px] font-semibold mt-0.5">Overdue</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All households */}
      <div className="px-5 mt-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="devanagari font-bold text-zinc-800">सभी घर भेंट</h3>
          <button
            onClick={() => navigate('log-visit')}
            className="bg-terra text-white text-xs px-3 py-1.5 rounded-full font-bold devanagari hover:bg-terra-light active:scale-[0.97] transition-all"
          >
            + नई भेंट
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {households.map((h) => (
            <button
              key={h.id}
              onClick={() => navigate('log-visit')}
              className="bg-white rounded-xl p-3 border border-cream-dark flex items-center gap-3 text-left hover:shadow-sm active:scale-[0.98] transition-all w-full"
            >
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  h.riskLevel === 'high'
                    ? 'bg-red-500'
                    : h.riskLevel === 'medium'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="devanagari font-semibold text-zinc-800 text-sm">{h.headNameHi}</p>
                <p className="text-zinc-400 text-xs">{h.village} · {h.members} सदस्य</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-zinc-400 text-[10px]">{h.lastVisit}</p>
                {h.tags.length > 0 && (
                  <p className="text-amber-500 text-[10px] font-bold">{h.tags.length} alerts</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
