import { useState } from 'react'
import { useNav } from '../../context/NavContext'

const SYMPTOM_TAGS = [
  'Fever',
  'Cough',
  'Vomiting',
  'Diarrhea',
  'Breathing Difficulty',
  'Abdominal Pain',
  'Skin Rash',
  'Headache',
  'Fatigue',
  'Loss of Appetite',
]

export default function LogVisit() {
  const { goBack, navigate } = useNav()

  const [submitted, setSubmitted] = useState(false)

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])

  const [form, setForm] = useState({
    head: 'Ramesh Yadav',
    village: 'Pipariya',
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
      prev.includes(s)
        ? prev.filter((x) => x !== s)
        : [...prev, s]
    )
  }

  const handleSubmit = () => {
    setSubmitted(true)

    setTimeout(() => {
      navigate('asha-dashboard')
    }, 2800)
  }

  /* ================= SUBMITTED SCREEN ================= */

  if (submitted) {
    return (
      <div className="h-full bg-cream flex flex-col items-center justify-center px-8 text-center">

        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-5xl mb-6">
          ✅
        </div>

        <h2 className="text-2xl font-bold text-emerald-700 mb-2">
          Visit Logged Successfully!
        </h2>

        <p className="text-zinc-500 text-sm mb-6">
          Household visit has been recorded.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 w-full">

          <p className="text-amber-800 text-sm font-bold mb-0.5">
            📴 Saved Offline
          </p>

          <p className="text-amber-600 text-xs">
            Saved to device — will sync to PHC when connected
          </p>

        </div>

        <p className="text-zinc-400 text-xs mt-4">
          Returning to dashboard...
        </p>

      </div>
    )
  }

  /* ================= MAIN SCREEN ================= */

  return (
    <div className="min-h-full bg-cream overflow-y-auto">

      {/* ================= HEADER ================= */}

      <div className="bg-terra text-white px-5 pt-4 pb-5">

        <button
          onClick={goBack}
          className="text-orange-200 mb-3 flex items-center gap-1 text-sm"
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

        <h2 className="text-2xl font-bold">
          Log Household Visit
        </h2>

        <p className="text-orange-200 text-sm">
          Record household health information
        </p>

        <div className="mt-2 flex items-center gap-2">

          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />

          <p className="text-orange-300 text-xs">
            Saves offline automatically
          </p>

        </div>

      </div>


      {/* ================= FORM ================= */}

      <div className="px-5 py-4 flex flex-col gap-4">


        {/* ================= HOUSEHOLD INFO ================= */}

        <div className="bg-white rounded-xl p-4 border border-cream-dark">

          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-3">
            Household Information
          </p>

          <div className="flex flex-col gap-3">

            {/* Head of Household */}

            <div>

              <label className="text-xs text-zinc-500 mb-1 block font-medium">
                Head of Household
              </label>

              <input
                value={form.head}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    head: e.target.value,
                  }))
                }
                className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-terra focus:ring-1 focus:ring-terra/30"
              />

            </div>


            {/* Village + Members */}

            <div className="grid grid-cols-2 gap-3">

              <div>

                <label className="text-xs text-zinc-500 mb-1 block font-medium">
                  Village
                </label>

                <input
                  value={form.village}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      village: e.target.value,
                    }))
                  }
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-terra"
                />

              </div>


              <div>

                <label className="text-xs text-zinc-500 mb-1 block font-medium">
                  Members
                </label>

                <input
                  type="number"
                  value={form.members}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      members: e.target.value,
                    }))
                  }
                  className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-terra"
                />

              </div>

            </div>

          </div>

        </div>


        {/* ================= SYMPTOMS ================= */}

        <div className="bg-white rounded-xl p-4 border border-cream-dark">

          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-3">
            Symptoms Observed
          </p>

          <div className="flex flex-wrap gap-2">

            {SYMPTOM_TAGS.map((s) => (

              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-all font-medium ${
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


        {/* ================= SPECIAL CONDITIONS ================= */}

        <div className="bg-white rounded-xl p-4 border border-cream-dark">

          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-3">
            Special Conditions
          </p>

          <div className="flex flex-col gap-3">


            {/* Pregnancy */}

            <label className="flex items-center gap-3 cursor-pointer">

              <input
                type="checkbox"
                checked={form.pregnancy}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    pregnancy: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded accent-terra"
              />

              <span className="text-sm text-zinc-700 font-medium">
                Pregnancy
              </span>

            </label>


            {/* Pregnancy Month */}

            {form.pregnancy && (

              <input
                placeholder="Month number (1-9)"
                value={form.pregnancyMonth}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    pregnancyMonth: e.target.value,
                  }))
                }
                className="border border-zinc-200 rounded-xl px-3 py-2 text-sm ml-8 focus:outline-none focus:border-terra"
              />

            )}


            {/* Vaccination */}

            <label className="flex items-center gap-3 cursor-pointer">

              <input
                type="checkbox"
                checked={form.vaccination}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    vaccination: e.target.checked,
                  }))
                }
                className="w-5 h-5 rounded accent-terra"
              />

              <span className="text-sm text-zinc-700 font-medium">
                Vaccination Due
              </span>

            </label>

          </div>

        </div>


        {/* ================= MEDICINES ================= */}

        <div className="bg-white rounded-xl p-4 border border-cream-dark">

          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-2">
            Medicines Given
          </p>

          <textarea
            value={form.medicines}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                medicines: e.target.value,
              }))
            }
            placeholder="Example: ORS 2 packets, Paracetamol 500mg x 10..."
            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-terra min-h-20 resize-none"
          />

        </div>


        {/* ================= NEXT VISIT ================= */}

        <div className="bg-white rounded-xl p-4 border border-cream-dark">

          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-2">
            Next Visit Date
          </p>

          <input
            type="date"
            value={form.nextVisit}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                nextVisit: e.target.value,
              }))
            }
            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-terra"
          />

        </div>


        {/* ================= NOTES ================= */}

        <div className="bg-white rounded-xl p-4 border border-cream-dark">

          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-2">
            Additional Notes
          </p>

          <textarea
            value={form.notes}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                notes: e.target.value,
              }))
            }
            placeholder="Add any additional observations..."
            className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-terra min-h-20 resize-none"
          />

        </div>


        {/* ================= SUBMIT ================= */}

        <button
          onClick={handleSubmit}
          className="w-full bg-terra text-white rounded-xl py-4 font-bold text-base hover:bg-terra-light active:scale-[0.98] transition-all shadow-sm"
        >
          📝 Save Visit
        </button>


        {/* ================= OFFLINE FOOTER ================= */}

        <div className="flex items-center justify-center gap-2 pb-6">

          <span className="text-amber-500">
            📴
          </span>

          <p className="text-zinc-400 text-xs">
            Saved offline · Syncs to PHC when connected
          </p>

        </div>

      </div>

    </div>
  )
}