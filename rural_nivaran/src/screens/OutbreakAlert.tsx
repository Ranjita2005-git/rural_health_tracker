import { useState } from 'react'
import { useNav } from '../context/NavContext'
import { useTranslation } from 'react-i18next'

const CASES = [
  {
    id: 1,
    nameHi: 'परिवार 1 — वार्ड 3, घर नं. 14',
    symptomsHi: 'तेज बुखार, दाने, जोड़ों में दर्द',
    time: '14 Aug, 9:00 AM',
  },
  {
    id: 2,
    nameHi: 'परिवार 2 — वार्ड 3, घर नं. 22',
    symptomsHi: 'बुखार, सिरदर्द, उल्टी',
    time: '14 Aug, 11:30 AM',
  },
  {
    id: 3,
    nameHi: 'परिवार 3 — वार्ड 3, घर नं. 31',
    symptomsHi: 'तेज बुखार, दाने, थकान',
    time: '15 Aug, 8:15 AM',
  },
  {
    id: 4,
    nameHi: 'परिवार 4 — वार्ड 3, घर नं. 38',
    symptomsHi: 'बुखार, थकान, भूख न लगना',
    time: '15 Aug, 2:00 PM',
  },
  {
    id: 5,
    nameHi: 'परिवार 5 — वार्ड 3, घर नं. 47',
    symptomsHi: 'बुखार, जोड़ों में दर्द',
    time: '16 Aug, 7:45 AM',
  },
]

const SYMPTOMS_SUMMARY = [
  { hi: 'तेज बुखार', en: 'High fever', count: 5 },
  { hi: 'दाने', en: 'Rash', count: 3 },
  { hi: 'जोड़ों में दर्द', en: 'Joint pain', count: 3 },
  { hi: 'सिरदर्द', en: 'Headache', count: 2 },
  { hi: 'उल्टी', en: 'Vomiting', count: 2 },
]

export default function OutbreakAlert() {
  const { goBack } = useNav()
  const { t } = useTranslation()

  const [confirmed, setConfirmed] = useState(false)
  const [investigating, setInvestigating] = useState(false)

  return (
    <div className="min-h-full bg-cream overflow-y-auto">

      {/* Alert header */}
      <div className="bg-red-600 text-white px-5 pt-4 pb-7">

        <button
          onClick={goBack}
          className="text-red-200 mb-3 flex items-center gap-1 text-sm"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>

          {t('outbreakAlert.back')}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border border-white/20">
            🦟
          </div>

          <div>
            <div className="inline-flex items-center bg-white/90 text-red-700 text-[10px] font-black px-2.5 py-1 rounded-full mb-1.5">
              ⚠ {t('outbreakAlert.alert')}
            </div>

            <h2 className="devanagari text-xl font-bold leading-tight">
              {t('outbreakAlert.title')}
            </h2>

            <p className="text-red-200 text-sm">
              {t('outbreakAlert.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            {
              n: '5',
              label: t('outbreakAlert.stats.cases'),
            },
            {
              n: '48h',
              label: t('outbreakAlert.stats.period'),
            },
            {
              n: 'Ward 3',
              label: t('outbreakAlert.stats.location'),
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white/15 rounded-xl p-2.5 text-center border border-white/10"
            >
              <p className="text-xl font-black text-white">
                {s.n}
              </p>

              <p className="text-red-100 text-[10px] whitespace-pre-line leading-tight">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Alert sent */}
      <div className="px-5 mt-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3">
          <span className="text-xl">✅</span>

          <div className="flex-1">
            <p className="devanagari font-bold text-emerald-800 text-sm">
              {t('outbreakAlert.alertSent')}
            </p>

            <p className="text-emerald-600 text-xs">
              {t('outbreakAlert.alertDelivered')}
            </p>
          </div>

          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
        </div>
      </div>

      {/* Status */}
      {(confirmed || investigating) && (
        <div className="px-5 mt-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
            <span className="text-xl">
              {confirmed ? '🔒' : '🔍'}
            </span>

            <div>
              <p className="devanagari font-bold text-blue-800 text-sm">
                {confirmed
                  ? t('outbreakAlert.confirmedTitle')
                  : t('outbreakAlert.investigatingTitle')}
              </p>

              <p className="text-blue-600 text-xs">
                {confirmed
                  ? t('outbreakAlert.confirmedDescription')
                  : t('outbreakAlert.investigatingDescription')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Common symptoms */}
      <div className="px-5 mt-5">
        <h3 className="devanagari font-bold text-zinc-800 mb-3">
          {t('outbreakAlert.commonSymptoms')}
        </h3>

        <div className="flex flex-wrap gap-2">
          {SYMPTOMS_SUMMARY.map((s) => (
            <div
              key={s.hi}
              className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-center gap-2.5"
            >
              <div className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-black flex-shrink-0">
                {s.count}
              </div>

              <div>
                <p className="devanagari text-red-800 text-xs font-bold leading-none">
                  {s.hi}
                </p>

                <p className="text-red-400 text-[10px]">
                  {s.en}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 mt-5">
        <h3 className="devanagari font-bold text-zinc-800 mb-3">
          {t('outbreakAlert.caseList')}
        </h3>

        <div className="flex flex-col gap-1">
          {CASES.map((c, i) => (
            <div key={c.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 bg-red-500 text-white rounded-full text-xs font-black flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>

                {i < CASES.length - 1 && (
                  <div className="w-0.5 flex-1 bg-red-200 mt-1 mb-1 min-h-4" />
                )}
              </div>

              <div className="bg-white rounded-xl border border-cream-dark p-3 flex-1 mb-2">
                <p className="devanagari font-bold text-zinc-800 text-sm">
                  {c.nameHi}
                </p>

                <p className="devanagari text-zinc-500 text-xs mt-0.5">
                  {c.symptomsHi}
                </p>

                <p className="text-zinc-400 text-[10px] mt-1">
                  {c.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 mt-5 mb-8 flex flex-col gap-3">

        {!confirmed ? (
          <button
            onClick={() => setConfirmed(true)}
            className="w-full bg-red-600 text-white rounded-xl py-4 font-bold devanagari text-base hover:bg-red-700 active:scale-[0.98] transition-all"
          >
            🚨 {t('outbreakAlert.confirmButton')}
          </button>
        ) : (
          <div className="w-full bg-emerald-600 text-white rounded-xl py-4 text-center font-bold devanagari">
            ✅ {t('outbreakAlert.confirmedButton')}
          </div>
        )}

        {!investigating ? (
          <button
            onClick={() => setInvestigating(true)}
            className="w-full bg-amber-500 text-white rounded-xl py-3 font-bold devanagari text-sm hover:bg-amber-600 active:scale-[0.98] transition-all"
          >
            🔍 {t('outbreakAlert.investigationButton')}
          </button>
        ) : (
          <div className="w-full bg-amber-100 text-amber-700 rounded-xl py-3 text-center font-bold devanagari text-sm">
            🔍 {t('outbreakAlert.investigationProgress')}
          </div>
        )}

        {!confirmed && !investigating && (
          <button
            className="w-full bg-white text-zinc-400 border border-zinc-200 rounded-xl py-3 text-sm devanagari hover:bg-zinc-50 active:scale-[0.98] transition-all"
          >
            {t('outbreakAlert.dismissButton')}
          </button>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
          <p className="devanagari text-blue-700 text-xs font-semibold mb-0.5">
            📋 {t('outbreakAlert.autoReportTitle')}
          </p>

          <p className="text-blue-600 text-xs">
            {t('outbreakAlert.autoReportDescription')}
          </p>
        </div>

      </div>
    </div>
  )
}