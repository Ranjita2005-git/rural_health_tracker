import { useState, useEffect } from 'react'
import { useNav } from '../../context/NavContext'
import { useAuth } from '../../context/AuthContext'
import { households } from '../../data'
import {
  getNearbyAvailability,
  type ApiFacilityAvailabilitySummary,
} from '../../services/api'
import { getCurrentLocation } from '../../services/locationService'

export default function ASHADashboard() {
  const { navigate } = useNav()
  const { user, signOut } = useAuth()

  const highRisk = households.filter((h) => h.riskLevel === 'high')
  const [availability, setAvailability] = useState<ApiFacilityAvailabilitySummary[]>([])
  const [loadingAvail, setLoadingAvail] = useState(false)
  const [liveMode, setLiveMode] = useState(false)

  // Fetch nearby doctor availability on mount if location is accessible
  useEffect(() => {
    let cancelled = false
    setLoadingAvail(true)

    getCurrentLocation()
      .then(async (loc) => {
        if (cancelled) return
        const data = await getNearbyAvailability(loc.latitude, loc.longitude, 50)
        if (!cancelled && data && data.length > 0) {
          setAvailability(data)
          setLiveMode(true)
        }
      })
      .catch(() => { /* location denied — stay in static mode */ })
      .finally(() => { if (!cancelled) setLoadingAvail(false) })

    return () => { cancelled = true }
  }, [])

  // Count doctors available across all nearby facilities
  const totalAvailableDoctors = availability.reduce(
    (sum, fac) => sum + fac.doctors.filter(d => d.status === 'available').length,
    0
  )
  return (
    <div className="min-h-full bg-cream overflow-y-auto">

      {/* ================= HEADER ================= */}
      <div className="bg-terra px-5 pt-4 pb-8 text-white">
        <div className="flex items-center justify-between mb-4">

          <div>
            <p className="text-orange-200 text-xs font-medium">
              ASHA Worker
            </p>

            <h1 className="text-2xl font-bold">
              {user?.name ?? 'ASHA Worker'}
            </h1>

            <p className="text-orange-300 text-xs">
              {user ? `+91 ${user.phoneNumber}` : 'Rampur Sector, Betul'} 
            </p>
          </div>

           <div className="flex flex-col items-end gap-2">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl border border-white/25">
              👩
            </div>
            <button
              onClick={signOut}
              className="text-orange-300 text-[10px] font-semibold hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>

        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-3 gap-2">

          {[
            {
              n: String(households.length),
              label: 'Home Visits\nPending',
              bg: 'bg-white/15',
            },
            {
              n: String(highRisk.length),
              label: 'High Risk\nFamilies',
              bg: 'bg-red-600/50',
            },
            {
              n: '4',
              label: 'Pending Sync\nRecords',
              bg: 'bg-amber-500/50',
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`${s.bg} rounded-xl p-2.5 text-center`}
            >
              <p className="text-2xl font-black text-white">
                {s.n}
              </p>

              <p className="text-white/75 text-[10px] whitespace-pre-line leading-tight">
                {s.label}
              </p>
            </div>
          ))}

        </div>
      </div>


      {/* ================= SYNC STATUS ================= */}
      <div className="px-5 mt-4">

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">

          <span className="text-xl">
            🔄
          </span>

          <div className="flex-1">

            <p className="text-amber-800 text-sm font-bold">
              4 records pending sync
            </p>

            <p className="text-amber-600 text-xs">
              Auto-syncs when phone gets internet
            </p>

          </div>

          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />

        </div>

      </div>
      
      {/* ================= NEARBY DOCTOR AVAILABILITY ================= */}
      {(liveMode || loadingAvail) && (
        <div className="px-5 mt-3">
          <div className="bg-white rounded-xl border border-cream-dark overflow-hidden">

            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${liveMode ? 'bg-green-500 animate-pulse' : 'bg-zinc-300'}`} />
                <h3 className="font-bold text-zinc-800 text-sm">Nearby Doctor Availability</h3>
              </div>
              {liveMode && (
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  LIVE · {totalAvailableDoctors} available
                </span>
              )}
            </div>

            {loadingAvail && !liveMode ? (
              <div className="px-4 py-3 flex items-center gap-2 text-zinc-400 text-sm">
                <div className="w-4 h-4 border-2 border-zinc-300 border-t-terra rounded-full animate-spin" />
                Fetching live data...
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {availability.slice(0, 5).map(fac => (
                  <div key={fac.facility_id} className="px-4 py-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-zinc-800 text-sm truncate">{fac.facility_name}</p>
                        <p className="text-zinc-400 text-xs">{fac.facility_type.toUpperCase()} · {fac.distance_km} km</p>
                      </div>
                      <div className={`flex-shrink-0 ml-3 text-xs font-bold px-2.5 py-1 rounded-full ${
                        fac.has_available_doctor
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}>
                        {fac.has_available_doctor ? '● Available' : '○ Unavailable'}
                      </div>
                    </div>

                    {fac.doctors.filter(d => d.status === 'available').map(doc => (
                      <div key={doc.doctor_id} className="mt-1 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                        <span className="text-zinc-600 text-xs">{doc.doctor_name}</span>
                        <span className="text-zinc-300 text-xs">·</span>
                        <span className="text-zinc-400 text-xs">{doc.specialization}</span>
                        {doc.expected_departure_time && (
                          <span className="text-emerald-600 text-[10px] font-semibold ml-auto">
                            until {doc.expected_departure_time}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}



      {/* ================= OUTBREAK ALERT ================= */}
      <div className="px-5 mt-3">

        <button
          onClick={() => navigate('outbreak-alert')}
          className="w-full bg-red-50 border-2 border-red-300 rounded-xl p-3.5 flex items-center gap-3 text-left hover:bg-red-100 active:scale-[0.98] transition-all"
        >

          <span className="text-2xl">
            🚨
          </span>

          <div className="flex-1">

            <p className="text-red-700 font-bold text-sm">
              Ward 3 — Suspected Dengue Cluster
            </p>

            <p className="text-red-500 text-xs">
              5 cases · 48 hours · Fever + Rash · Dengue cluster flagged
            </p>

          </div>

          <svg
            className="w-4 h-4 text-red-400 flex-shrink-0"
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

        </button>

      </div>


      {/* ================= HIGH RISK FAMILIES ================= */}
      <div className="px-5 mt-5">

        <div className="flex items-center justify-between mb-3">

          <h3 className="font-bold text-zinc-800">
            High Risk Families
          </h3>

          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {highRisk.length} HIGH RISK
          </span>

        </div>


        <div className="flex flex-col gap-2">

          {highRisk.map((h) => (

            <div
              key={h.id}
              className="bg-white border-l-4 border-red-500 rounded-r-xl p-3 flex items-start gap-3 shadow-sm"
            >

              {/* Person icon */}
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-xl flex-shrink-0 border border-red-100">
                👤
              </div>


              {/* Family information */}
              <div className="flex-1 min-w-0">

                <p className="font-bold text-zinc-800 text-sm">
                  {h.headNameHi}
                </p>

                <p className="text-zinc-400 text-xs">
                  {h.village} · {h.members} members
                </p>


                {/* Risk tags */}
                <div className="flex flex-wrap gap-1 mt-1.5">

                  {h.tags.map((tag) => (

                    <span
                      key={tag}
                      className="bg-red-50 text-red-600 text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                    >
                      {tag}
                    </span>

                  ))}

                </div>

              </div>


              {/* Last visit */}
              <div className="text-right flex-shrink-0">

                <p className="text-zinc-400 text-[10px]">
                  Last visit
                </p>

                <p className="text-zinc-600 text-xs font-semibold">
                  {h.lastVisit.slice(5).replace('-', '/')}
                </p>

                <p className="text-red-500 text-[10px] font-semibold mt-0.5">
                  Overdue
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>


      {/* ================= ALL HOUSEHOLDS ================= */}
      <div className="px-5 mt-5 mb-8">

        <div className="flex items-center justify-between mb-3">

          <h3 className="font-bold text-zinc-800">
            All Home Visits
          </h3>

          <button
            onClick={() => navigate('log-visit')}
            className="bg-terra text-white text-xs px-3 py-1.5 rounded-full font-bold hover:bg-terra-light active:scale-[0.97] transition-all"
          >
            + New Visit
          </button>

        </div>


        <div className="flex flex-col gap-2">

          {households.map((h) => (

            <button
              key={h.id}
              onClick={() => navigate('log-visit')}
              className="bg-white rounded-xl p-3 border border-cream-dark flex items-center gap-3 text-left hover:shadow-sm active:scale-[0.98] transition-all w-full"
            >

              {/* Risk indicator */}
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  h.riskLevel === 'high'
                    ? 'bg-red-500'
                    : h.riskLevel === 'medium'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />


              {/* Household information */}
              <div className="flex-1 min-w-0">

                <p className="font-semibold text-zinc-800 text-sm">
                  {h.headNameHi}
                </p>

                <p className="text-zinc-400 text-xs">
                  {h.village} · {h.members} members
                </p>

              </div>


              {/* Visit information */}
              <div className="text-right flex-shrink-0">

                <p className="text-zinc-400 text-[10px]">
                  {h.lastVisit}
                </p>

                {h.tags.length > 0 && (
                  <p className="text-amber-500 text-[10px] font-bold">
                    {h.tags.length} alerts
                  </p>
                )}

              </div>

            </button>

          ))}

        </div>

      </div>

    </div>
  )
}
