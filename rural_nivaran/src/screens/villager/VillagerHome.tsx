import { useState, useEffect } from 'react'
import { useNav } from '../../context/NavContext'
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../../services/api'


export default function VillagerHome() {
  const { navigate } = useNav()
  const { t } = useTranslation();

  // Ping the backend health-check endpoint once on mount to determine
  // whether the server is reachable (determines LIVE vs OFFLINE badge).
  const [serverOnline, setServerOnline] = useState<boolean | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${API_BASE}/`, { signal: controller.signal })
      .then(r => setServerOnline(r.ok))
      .catch(() => setServerOnline(false))
    return () => controller.abort()
  }, [])

  return (
    <div className="min-h-full bg-cream overflow-y-auto">

      {/* Header */}
      <div className="bg-forest px-5 pt-4 pb-10 text-white">
        <div className="flex items-center justify-between mb-3">

          <div>
            <p className="text-green-300 text-xs font-medium">
              {t('villager.greeting')} 🙏
            </p>

            <h1 className="devanagari text-2xl font-bold">
                {t('villager.villageName')}
            </h1>

            <p className="text-green-400 text-xs">
              {t('villager.district')}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {serverOnline === null ? (
              <div className="bg-zinc-400/60 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                ● Checking...
              </div>
            ) : serverOnline ? (
              <div className="bg-green-400 text-green-900 text-[10px] font-black px-2.5 py-1 rounded-full">
                ● LIVE
              </div>
            ) : (
            <div className="bg-amber-400 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full">
              ● {t('common.offline')}
            </div>
            )}
            <p className="text-green-400 text-[10px]">
              {t('villager.lastSync')}
            </p>

          </div>
        </div>

        <div className="bg-white/10 border border-white/15 rounded-xl px-3 py-2 mt-2">

          <p className="devanagari text-green-100 text-sm">
            {serverOnline ? 'Server connected' : t('villager.lastSync')}
          </p>

          <p className="text-green-400 text-xs">
            {t('villager.feelingTodayEnglish')}
          </p>

        </div>
      </div>


      {/* Main voice card */}
      <div className="px-5 -mt-5">

        <button
          onClick={() => navigate('symptom-input')}
          className="w-full bg-white rounded-2xl shadow-lg shadow-black/10 p-5 text-center border border-cream-dark hover:shadow-xl active:scale-[0.98] transition-all duration-150"
        >

          <div className="w-20 h-20 bg-forest rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">

            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>

          </div>

          <p className="devanagari text-xl font-bold text-forest mb-1">
            {t('villager.tellSymptoms')}
          </p>

          <p className="text-zinc-500 text-sm mb-3">
            {t('villager.speakSymptoms')}
          </p>
        </button>

      </div>


      {/* Quick actions */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-3">

        {/* PHC */}
        <button
          onClick={() => navigate('phc-locator')}
          className="bg-white rounded-xl p-4 border border-cream-dark hover:shadow-md active:scale-[0.97] transition-all text-left"
        >

          <div className="text-2xl mb-2">🏥</div>

          <p className="devanagari font-semibold text-zinc-800 text-sm leading-tight">
            {t('villager.nearestPHC')}
          </p>

          <p className="text-zinc-400 text-xs">
            {t('villager.findNearestClinic')}
          </p>

          <p className="text-forest text-xs font-bold mt-1.5">
            2.3 km {t('common.away')} →
          </p>

        </button>


        {/* Photo diagnosis */}
        <button
          onClick={() => navigate('symptom-input')}
          className="bg-white rounded-xl p-4 border border-cream-dark hover:shadow-md active:scale-[0.97] transition-all text-left"
        >

          <div className="text-2xl mb-2">📸</div>

          <p className="devanagari font-semibold text-zinc-800 text-sm leading-tight">
            {t('villager.photoCheck')}
          </p>

          <p className="text-zinc-400 text-xs">
            {t('villager.photoDiagnosis')}
          </p>

          <p className="text-terra text-xs font-bold mt-1.5">
            {t('villager.rashWound')} →
          </p>

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

                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {t('common.alert')}
                </span>

                <span className="text-zinc-400 text-[10px]">
                  16 Aug, 7:50 AM
                </span>

              </div>

              <p className="devanagari font-bold text-red-700 text-sm">
                {t('villager.wardAlert')}
              </p>

              <p className="text-red-600 text-xs">
                {t('villager.dengueCluster')}
              </p>

            </div>

            <svg
              className="w-4 h-4 text-red-400 flex-shrink-0 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>

          </div>

        </button>

      </div>


      {/* Last check */}
      <div className="px-5 mt-4 mb-8">

        <h3 className="devanagari text-xs font-bold text-zinc-400 uppercase tracking-wide mb-2">
          {t('villager.lastCheck')}
        </h3>

        <button
          onClick={() => navigate('triage-result')}
          className="w-full bg-white rounded-xl p-4 border border-cream-dark hover:shadow-md active:scale-[0.98] transition-all"
        >

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 font-bold">✓</span>
            </div>

            <div className="flex-1 text-left">

              <p className="devanagari text-zinc-800 text-sm font-semibold">
                {t('villager.feverHeadache')}
              </p>

              <p className="text-zinc-400 text-xs">
                {t('villager.feverHeadacheAgo')}
              </p>

            </div>

            <div className="bg-green-100 px-2.5 py-1.5 rounded-lg">

              <p className="devanagari text-green-700 text-xs font-bold">
                {t('villager.restAtHome')}
              </p>

            </div>

          </div>

        </button>

      </div>

    </div>
  )
}