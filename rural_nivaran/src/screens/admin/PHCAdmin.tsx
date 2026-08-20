import { useState } from 'react'
import { useNav } from '../../context/NavContext'
import { facilities } from '../../data'
import type { Doctor } from '../../types'

type Tab = 'doctors' | 'referrals' | 'stats'

const REFERRALS = [
  {
    id: 'r1',
    patientHi: 'रमेश यादव',
    from: 'Villager App',
    conditionHi: 'तेज बुखार, उल्टी, 3 दिन',
    urgent: true,
    time: '10:32 AM',
  },
  {
    id: 'r2',
    patientHi: 'कमला बाई',
    from: 'ASHA Worker',
    conditionHi: 'मधुमेह फॉलो-अप',
    urgent: false,
    time: '9:15 AM',
  },
  {
    id: 'r3',
    patientHi: 'सुनीता देवी',
    from: 'ASHA Worker',
    conditionHi: 'गर्भावस्था जाँच — 8वां महीना',
    urgent: true,
    time: '8:50 AM',
  },
]

const STATS = [
  { labelHi: 'OPD मरीज', labelEn: 'OPD Patients', value: 134, max: 200, color: 'bg-blue-600' },
  { labelHi: 'रेफरल प्राप्त', labelEn: 'Referrals Received', value: 12, max: 30, color: 'bg-terra' },
  { labelHi: 'प्रसव', labelEn: 'Deliveries', value: 3, max: 10, color: 'bg-pink-500' },
  { labelHi: 'टीकाकरण', labelEn: 'Vaccinations', value: 47, max: 60, color: 'bg-emerald-600' },
]

export default function PHCAdmin() {
  const { navigate } = useNav()
  const phc = facilities[0]
  const [doctors, setDoctors] = useState<Doctor[]>(phc.doctors.map((d) => ({ ...d })))
  const [beds, setBeds] = useState({ total: 20, occupied: 14 })
  const [tab, setTab] = useState<Tab>('doctors')
  const [referralStatus, setReferralStatus] = useState<Record<string, 'pending' | 'accepted' | 'redirected'>>({
    r1: 'pending',
    r2: 'pending',
    r3: 'pending',
  })

  const toggleDoc = (id: string) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isAvailable: !d.isAvailable } : d))
    )
  }

  return (
    <div className="min-h-full bg-cream overflow-y-auto">
      {/* Header */}
      <div className="bg-blue-700 text-white px-5 pt-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-200 text-xs font-medium">PHC प्रशासक</p>
            <h1 className="devanagari text-xl font-bold leading-tight">{phc.nameHi}</h1>
            <p className="text-blue-300 text-xs">Admin Dashboard</p>
          </div>
          <div className="text-right">
            <div className="bg-emerald-400 text-emerald-900 text-[10px] font-black px-2.5 py-1 rounded-full mb-1.5">
              ● OPEN
            </div>
            <p className="text-blue-300 text-xs">OPD: 9AM–2PM</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { n: `${beds.occupied}/${beds.total}`, label: 'Beds\nOccupied', bg: 'bg-white/15' },
            { n: String(doctors.filter((d) => d.isAvailable).length), label: 'Doctors\nAvailable', bg: 'bg-emerald-500/40' },
            { n: String(Object.values(referralStatus).filter((s) => s === 'pending').length), label: 'Referrals\nPending', bg: 'bg-amber-400/40' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-xl p-2.5 text-center`}>
              <p className="text-2xl font-black text-white">{s.n}</p>
              <p className="text-white/75 text-[10px] whitespace-pre-line leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Outbreak alert */}
      <div className="px-5 mt-4">
        <button
          onClick={() => navigate('outbreak-alert')}
          className="w-full bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-2 text-left hover:bg-red-100 active:scale-[0.98] transition-all"
        >
          <span className="text-xl">🚨</span>
          <div className="flex-1">
            <p className="devanagari text-red-700 font-bold text-sm">वार्ड 3 प्रकोप अलर्ट</p>
            <p className="text-red-500 text-xs">Dengue cluster — action required</p>
          </div>
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-5 mt-4 gap-2">
        {([['doctors', '👨‍⚕️ Doctors'], ['referrals', '📋 Referrals'], ['stats', '📊 Stats']] as const).map(([t, l]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 text-xs py-2.5 rounded-xl font-bold transition-all ${
              tab === t ? 'bg-blue-700 text-white shadow-sm' : 'bg-white text-zinc-500 border border-zinc-200'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="px-5 mt-4 pb-8">
        {/* Doctors tab */}
        {tab === 'doctors' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="devanagari font-bold text-zinc-800">आज का रोस्टर</h3>
              <button className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-bold hover:bg-blue-700 active:scale-[0.97] transition-all">
                + डॉक्टर जोड़ें
              </button>
            </div>

            {doctors.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl border border-cream-dark p-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-blue-100">
                    👨‍⚕️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="devanagari font-bold text-zinc-800 leading-tight">{doc.nameHi}</p>
                    <p className="devanagari text-zinc-500 text-xs">{doc.specializationHi}</p>
                    {doc.isAvailable && doc.availableUntil ? (
                      <p className="text-emerald-600 text-xs font-medium mt-0.5">Available until {doc.availableUntil}</p>
                    ) : (
                      <p className="text-zinc-400 text-xs mt-0.5">Not available today</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      onClick={() => toggleDoc(doc.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        doc.isAvailable ? 'bg-emerald-500' : 'bg-zinc-300'
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                          doc.isAvailable ? 'left-6' : 'left-0.5'
                        }`}
                      />
                    </button>
                    <p className={`text-[10px] font-bold ${doc.isAvailable ? 'text-emerald-600' : 'text-zinc-400'}`}>
                      {doc.isAvailable ? 'उपलब्ध' : 'अनुपलब्ध'}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Bed management */}
            <div className="bg-white rounded-xl border border-cream-dark p-4 mt-1">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="devanagari font-bold text-zinc-800">बेड उपलब्धता</p>
                  <p className="text-zinc-400 text-xs">Bed Availability</p>
                </div>
                <p className="font-black text-zinc-700 text-xl">
                  {beds.occupied}
                  <span className="text-zinc-300 font-normal text-base">/{beds.total}</span>
                </p>
              </div>
              <div className="h-3 bg-zinc-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${(beds.occupied / beds.total) * 100}%` }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setBeds((b) => ({ ...b, occupied: Math.min(b.total, b.occupied + 1) }))}
                  className="flex-1 bg-blue-100 text-blue-700 rounded-xl py-2.5 text-sm font-bold devanagari hover:bg-blue-200 active:scale-[0.97] transition-all"
                >
                  + बेड भरा
                </button>
                <button
                  onClick={() => setBeds((b) => ({ ...b, occupied: Math.max(0, b.occupied - 1) }))}
                  className="flex-1 bg-zinc-100 text-zinc-600 rounded-xl py-2.5 text-sm font-bold devanagari hover:bg-zinc-200 active:scale-[0.97] transition-all"
                >
                  − खाली हुआ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Referrals tab */}
        {tab === 'referrals' && (
          <div className="flex flex-col gap-3">
            <h3 className="devanagari font-bold text-zinc-800">आज के रेफरल</h3>
            {REFERRALS.map((r) => (
              <div
                key={r.id}
                className={`bg-white rounded-xl border border-cream-dark p-4 border-l-4 ${
                  r.urgent ? 'border-l-red-500' : 'border-l-amber-400'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {r.urgent && (
                        <span className="bg-red-100 text-red-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                          URGENT
                        </span>
                      )}
                      <span className="text-zinc-400 text-xs">{r.time}</span>
                    </div>
                    <p className="devanagari font-bold text-zinc-800">{r.patientHi}</p>
                    <p className="devanagari text-zinc-500 text-sm">{r.conditionHi}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                    {r.from}
                  </span>
                </div>

                {referralStatus[r.id] === 'pending' ? (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setReferralStatus((p) => ({ ...p, [r.id]: 'accepted' }))}
                      className="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 text-xs font-bold devanagari hover:bg-emerald-600 active:scale-[0.97] transition-all"
                    >
                      ✓ स्वीकार करें
                    </button>
                    <button
                      onClick={() => setReferralStatus((p) => ({ ...p, [r.id]: 'redirected' }))}
                      className="flex-1 bg-zinc-100 text-zinc-600 rounded-xl py-2.5 text-xs devanagari hover:bg-zinc-200 active:scale-[0.97] transition-all"
                    >
                      रीडायरेक्ट
                    </button>
                  </div>
                ) : (
                  <div className={`mt-2 rounded-xl py-2.5 text-center text-xs font-bold devanagari ${
                    referralStatus[r.id] === 'accepted'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {referralStatus[r.id] === 'accepted' ? '✓ स्वीकार किया गया' : 'रीडायरेक्ट किया गया'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats tab */}
        {tab === 'stats' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="devanagari font-bold text-zinc-800">इस सप्ताह की रिपोर्ट</h3>
              <span className="text-zinc-400 text-xs">12–19 Aug 2026</span>
            </div>
            {STATS.map((s) => (
              <div key={s.labelHi} className="bg-white rounded-xl border border-cream-dark p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="devanagari font-bold text-zinc-800 text-sm">{s.labelHi}</p>
                    <p className="text-zinc-400 text-xs">{s.labelEn}</p>
                  </div>
                  <p className="font-black text-zinc-700 text-xl">
                    {s.value}
                    <span className="text-zinc-300 font-normal text-sm">/{s.max}</span>
                  </p>
                </div>
                <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all`}
                    style={{ width: `${(s.value / s.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
