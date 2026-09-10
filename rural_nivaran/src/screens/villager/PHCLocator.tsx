import { useState } from 'react'
import { useNav } from '../../context/NavContext'
import { facilities } from '../../data'
import type { Facility } from '../../types'
import { useTranslation } from 'react-i18next'

type Filter = 'all' | 'PHC' | 'CHC' | 'District Hospital'

const TYPE_COLORS: Record<string, string> = {
  PHC: 'bg-green-100 text-green-700',
  CHC: 'bg-blue-100 text-blue-700',
  'District Hospital': 'bg-purple-100 text-purple-700',
}

export default function PHCLocator() {
  const { goBack } = useNav()
  const { t } = useTranslation()
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  const filtered: Facility[] =
    filter === 'all' ? facilities : facilities.filter((f) => f.type === filter)

  return (
    <div className="min-h-full bg-cream overflow-y-auto">
      {/* Header */}
      <div className="bg-forest text-white px-5 pt-4 pb-6">
        <button onClick={goBack} className="text-green-300 mb-3 flex items-center gap-1 text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('phcLocator.back')}
        </button>
        <h2 className="devanagari text-2xl font-bold">{t('phcLocator.title')}</h2>
        <p className="text-green-300 text-sm">{t('phcLocator.subtitle')}</p>
        <div className="mt-3 bg-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2 border border-white/10">
          <span className="text-xl">📍</span>
          <div>
           <p className="devanagari text-white text-sm font-semibold">
              {t('phcLocator.location')}
          </p>
          <p className="text-green-400 text-xs">
              {t('phcLocator.gps')}
          </p>
          </div>
          <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-5 mt-4 overflow-x-auto pb-1">
        {(['all', 'PHC', 'CHC', 'District Hospital'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
              filter === f
                ? 'bg-forest text-white'
                : 'bg-white text-zinc-500 border border-zinc-200'
            }`}
          >
            {f === 'all'
              ? t('phcLocator.all')
              : f === 'PHC'
              ? t('phcLocator.phc')
              : f === 'CHC'
              ? t('phcLocator.chc')
              : t('phcLocator.districtHospital')}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="px-5 mt-3 pb-8 flex flex-col gap-3">
        {filtered.map((facility) => (
          <div key={facility.id}>
            <button
              onClick={() =>
                setSelected(selected === facility.id ? null : facility.id)
              }
              className="w-full bg-white rounded-2xl border border-cream-dark p-4 text-left hover:shadow-md active:scale-[0.99] transition-all"
            >
              {/* Top row */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[facility.type]}`}>
                      {facility.type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        facility.isOpen
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {facility.isOpen
                        ? `● ${t('phcLocator.open')}`
                        : `● ${t('phcLocator.closed')}`}
                    </span>
                  </div>
                  <p className="devanagari font-bold text-zinc-800 text-base leading-tight">{facility.nameHi}</p>
                  <p className="text-zinc-400 text-xs">{facility.name}</p>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="text-forest font-black text-2xl leading-none">{facility.distance}</p>
                  <p className="text-zinc-400 text-xs">{t('phcLocator.km')}</p>
                </div>
              </div>

              <p className="devanagari text-zinc-500 text-xs mb-3 leading-relaxed">{facility.addressHi}</p>

              {/* Doctors */}
              <div className="flex flex-col gap-1.5 border-t border-cream-dark pt-2.5">
                {facility.doctors.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        doc.isAvailable ? 'bg-emerald-500' : 'bg-zinc-300'
                      }`}
                    />
                    <span className="devanagari text-zinc-700 text-xs font-medium">{doc.nameHi}</span>
                    <span className="text-zinc-300">•</span>
                    <span className="devanagari text-zinc-400 text-xs flex-1">{doc.specializationHi}</span>
                    {doc.isAvailable && doc.availableUntil && (
                      <span className="text-emerald-600 text-[10px] font-semibold">{t('phcLocator.until')} {doc.availableUntil}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-2.5 flex items-center justify-between">
                <p className="text-zinc-300 text-xs">{facility.phone}</p>
                <p className={`text-xs font-medium ${selected === facility.id ? 'text-forest' : 'text-zinc-300'}`}>
                  {selected === facility.id
                    ? t('phcLocator.hideActions')
                    : t('phcLocator.tapActions')}
                </p>
              </div>
            </button>

            {/* Expanded actions */}
            {selected === facility.id && (
              <div className="bg-white border border-cream-dark border-t-0 rounded-b-2xl -mt-2 pt-3 px-4 pb-4 flex gap-2">
                <a
                  href={`tel:${facility.phone}`}
                  className="flex-1 bg-forest text-white rounded-xl py-3 text-center text-sm font-bold devanagari hover:bg-forest-dark active:scale-[0.97] transition-all"
                >
                  📞 {t('phcLocator.call')}
                </a>
                <button className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-center text-sm font-bold devanagari hover:bg-blue-700 active:scale-[0.97] transition-all">
                  🗺️ {t('phcLocator.directions')}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Offline note */}
      <div className="px-5 mb-6">
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">
          <span>📴</span>
          <p className="text-amber-700 text-xs devanagari">
            {t('phcLocator.offlineNote')}
          </p>
        </div>
      </div>
    </div>
  )
}
