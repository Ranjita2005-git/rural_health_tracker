import { useState } from 'react'
import { useNav } from '../../context/NavContext'

const SYMPTOM_TAGS = [
  'बुखार', 'खांसी', 'उल्टी', 'दस्त',
  'सांस तकलीफ', 'पेट दर्द', 'त्वचा पर दाने', 'सिरदर्द',
  'थकान', 'भूख न लगना',
]

export default function LogVisit() {
  const { goBack, navigate } = useNav()
  const [submitted, setSubmitted] = useState(false)
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [form, setForm] = useState({
    head: 'रमेश यादव',
    village: 'पिपरिया',
    members: '6',
    pregnancy: false,
    pregnancyMonth: '',
    vaccination: false,
    medicines: '',
    nextVisit: '',
    notes: '',
  })

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => navigate('asha-dashboard'), 2800)
  }

  if (submitted) {
    return (
      <div className="h-full bg-cream flex flex-col items-center justify-center px-8 text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-5xl mb-6">
          ✅
        </div>
        <h2 className="devanagari text-2xl font-bold text-emerald-700 mb-2">भेंट दर्ज हो गई!</h2>
        <p className="text-zinc-500 text-sm mb-6">Visit logged successfully</p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 w-full">
          <p className="devanagari text-amber-800 text-sm font-bold mb-0.5">📴 ऑफ़लाइन सहेजा गया</p>
          <p className="text-amber-600 text-xs">Saved to device — will sync to PHC when connected</p>
        </div>
        <p className="text-zinc-400 text-xs mt-4">Returning to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-cream overflow-y-auto">
      {/* Header */}
      <div className="bg-terra text-white px-5 pt-4 pb-5">
        <button onClick={goBack} className="text-orange-200 mb-3 flex items-center gap-1 text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h2 className="devanagari text-2xl font-bold">घर भेंट लॉग करें</h2>
        <p className="text-orange-200 text-sm">Log Household Visit</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          <p className="text-orange-300 text-xs">Saves offline automatically</p>
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        {/* Household info */}
        <div className="bg-white rounded-xl p-4 border border-cream-dark">
          <p className="devanagari text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-3">
            परिवार की जानकारी · Household Info
          </p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="devanagari text-xs text-zinc-500 mb-1 block font-medium">मुखिया का नाम</label>
              <input
                value={form.head}
                onChange={(e) => setForm((p) => ({ ...p, head: e.target.value }))}
                className="devanagari w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-terra focus:ring-1 focus:ring-terra/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="devanagari text-xs text-zinc-500 mb-1 block font-medium">गाँव</label>
                <input
                  value={form.village}
                  onChange={(e) => setForm((p) => ({ ...p, village: e.target.value }))}
                  className="devanagari w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-terra"
                />
              </div>
              <div>
                <label className="devanagari text-xs text-zinc-500 mb-1 block font-medium">सदस्य</label>
                <input
                  type="number"
                  value={form.members}
                  onChange={(e) => setForm((p) => ({ ...p, members: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-terra"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div className="bg-white rounded-xl p-4 border border-cream-dark">
          <p className="devanagari text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-3">
            लक्षण · Symptoms Observed
          </p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_TAGS.map((s) => (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                className={`devanagari text-sm px-3 py-1.5 rounded-full border transition-all font-medium ${
                  selectedSymptoms.includes(s)
                    ? 'bg-terra text-white border-terra shadow-sm'
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-terra/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Special conditions */}
        <div className="bg-white rounded-xl p-4 border border-cream-dark">
          <p className="devanagari text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-3">
            विशेष स्थिति · Special Conditions
          </p>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.pregnancy}
                onChange={(e) => setForm((p) => ({ ...p, pregnancy: e.target.checked }))}
                className="w-5 h-5 rounded accent-terra"
              />
              <span className="devanagari text-sm text-zinc-700 font-medium">गर्भावस्था / Pregnancy</span>
            </label>
            {form.pregnancy && (
              <input
                placeholder="महीना / Month number (1-9)"
                value={form.pregnancyMonth}
                onChange={(e) => setForm((p) => ({ ...p, pregnancyMonth: e.target.value }))}
                className="devanagari border border-zinc-200 rounded-xl px-3 py-2 text-sm ml-8 focus:outline-none focus:border-terra"
              />
            )}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.vaccination}
                onChange={(e) => setForm((p) => ({ ...p, vaccination: e.target.checked }))}
                className="w-5 h-5 rounded accent-terra"
              />
              <span className="devanagari text-sm text-zinc-700 font-medium">टीकाकरण बाकी / Vaccination Due</span>
            </label>
          </div>
        </div>

        {/* Medicines */}
        <div className="bg-white rounded-xl p-4 border border-cream-dark">
          <p className="devanagari text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-2">
            दी गई दवाएं · Medicines Given
          </p>
          <textarea
            value={form.medicines}
            onChange={(e) => setForm((p) => ({ ...p, medicines: e.target.value }))}
            placeholder="जैसे: ORS 2 पैकेट, Paracetamol 500mg x 10..."
            className="devanagari w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-terra min-h-20 resize-none"
          />
        </div>

        {/* Next visit */}
        <div className="bg-white rounded-xl p-4 border border-cream-dark">
          <p className="devanagari text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-2">
            अगली भेंट · Next Visit Date
          </p>
          <input
            type="date"
            value={form.nextVisit}
            onChange={(e) => setForm((p) => ({ ...p, nextVisit: e.target.value }))}
            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-terra"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-terra text-white rounded-xl py-4 font-bold devanagari text-base hover:bg-terra-light active:scale-[0.98] transition-all shadow-sm"
        >
          📝 भेंट सहेजें — Save Visit
        </button>

        <div className="flex items-center justify-center gap-2 pb-6">
          <span className="text-amber-500">📴</span>
          <p className="text-zinc-400 text-xs">Saved offline · Syncs to PHC when connected</p>
        </div>
      </div>
    </div>
  )
}
