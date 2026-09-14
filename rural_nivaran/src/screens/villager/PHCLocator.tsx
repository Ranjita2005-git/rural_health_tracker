import { thaneFacilities } from '../../data/ThaneFacilities'
import { facilities as staticFacilities } from '../../data'
import { useState } from 'react'
import { useNav } from '../../context/NavContext'
import {
  getCurrentLocation,
  calculateDistance,
} from '../../services/locationService'
import {
  getNearbyFacilities,
  createReferral,
  type ApiFacility,
} from '../../services/api'
import type { Facility } from '../../types'

type Filter = 'all' | 'PHC' | 'CHC' | 'District Hospital'

const TYPE_COLORS: Record<string, string> = {
  PHC: 'bg-green-100 text-green-700',
  CHC: 'bg-blue-100 text-blue-700',
  'District Hospital': 'bg-purple-100 text-purple-700',
}

/** Map backend facility_type enum → frontend display string */
function mapFacilityType(t: string): Facility['type'] {
  if (t === 'CHC') return 'CHC'
  if (t === 'district_hospital') return 'District Hospital'
  return 'PHC'
}

/** Convert an API facility into the Facility shape the UI expects */
function apiFacilityToLocal(
  f: ApiFacility,
  distanceKm?: number
): Facility {
  return {
    id: f.id,
    name: f.name,
    nameHi: f.name,
    type: mapFacilityType(f.facility_type),
    distance: distanceKm ?? f.distance_km ?? 0,
    latitude: f.latitude,
    longitude: f.longitude,
    address: f.address ?? '',
    addressHi: f.address ?? '',
    phone: f.phone_number ?? '',
    isOpen: true,
    doctors: [],
  }
}

export default function PHCLocator() {
  const { goBack } = useNav()

  const [selected, setSelected] =
    useState<string | null>(null)

  const [filter, setFilter] =
    useState<Filter>('all')

  const [userLocation, setUserLocation] =
    useState<{
      latitude: number
      longitude: number
    } | null>(null)

  const [facilitiesWithDistance, setFacilitiesWithDistance] =
    useState<Facility[]>(thaneFacilities)

  const [nearestFacility, setNearestFacility] =
    useState<Facility | null>(null)

  const [locationLoading, setLocationLoading] =
    useState(false)

  const [locationError, setLocationError] =
    useState<string | null>(null)

  const [usingLiveData, setUsingLiveData] =
    useState(false)

  // =========================================================
  // Referral state
  // =========================================================

  const [showReferralModal, setShowReferralModal] =
    useState(false)

  const [referralFacility, setReferralFacility] =
    useState<Facility | null>(null)

  const [patientName, setPatientName] =
    useState('')

  const [patientPhone, setPatientPhone] =
    useState('')

  const [referralLoading, setReferralLoading] =
    useState(false)

  const [referralMessage, setReferralMessage] =
    useState<string | null>(null)

  // =========================================================
  // Create referral
  // =========================================================

  const handleCreateReferral = async () => {
    if (!referralFacility) {
      return
    }

    if (!patientName.trim()) {
      setReferralMessage(
        'Please enter the patient name.'
      )
      return
    }

    // Only real backend facilities should be used
    // for referrals.
    if (!usingLiveData) {
      setReferralMessage(
        'Please use "Use My Location" first to load live health facilities.'
      )
      return
    }

    setReferralLoading(true)
    setReferralMessage(null)

    // Get current triage level from the previous
    // symptom analysis.
    let triageLevel: string | undefined

    const savedChatbotResponse =
      localStorage.getItem('chatbotResponse')

    if (savedChatbotResponse) {
      try {
        const parsed = JSON.parse(
          savedChatbotResponse
        )

        triageLevel =
          parsed.triage ?? undefined
      } catch (error) {
        console.error(
          'Could not read chatbot response:',
          error
        )
      }
    }

    const symptoms =
      localStorage.getItem('symptoms') ||
      undefined

    const result = await createReferral({
      patient_name:
        patientName.trim(),

      patient_phone:
        patientPhone.trim() || undefined,

      facility_id:
        referralFacility.id,

      symptoms,

      triage_level:
        triageLevel,
    })

    if (!result) {
      setReferralMessage(
        'Failed to create referral. Please check your connection and try again.'
      )

      setReferralLoading(false)
      return
    }

    setReferralMessage(
      'Referral created successfully. The PHC has been notified.'
    )

    setPatientName('')
    setPatientPhone('')

    setTimeout(() => {
      setShowReferralModal(false)
      setReferralFacility(null)
      setReferralMessage(null)
    }, 1500)

    setReferralLoading(false)
  }

  // =========================================================
  // Get user location + nearby facilities
  // =========================================================

  const handleGetLocation = async () => {
    setLocationLoading(true)
    setLocationError(null)

    try {
      const location =
        await getCurrentLocation()

      setUserLocation(location)

      // -----------------------------------------------------
      // Try live API first
      // -----------------------------------------------------

      const apiFacilities =
        await getNearbyFacilities(
          location.latitude,
          location.longitude,
          50
        )

      if (
        apiFacilities &&
        apiFacilities.length > 0
      ) {
        const mapped =
          apiFacilities.map(f => {
            const dist =
              f.distance_km !== null
                ? f.distance_km
                : Number(
                    calculateDistance(
                      location.latitude,
                      location.longitude,
                      f.latitude,
                      f.longitude
                    ).toFixed(2)
                  )

            return apiFacilityToLocal(
              f,
              dist
            )
          })

        const sorted =
          [...mapped].sort(
            (a, b) =>
              a.distance - b.distance
          )

        setFacilitiesWithDistance(sorted)
        setNearestFacility(
          sorted[0] ?? null
        )

        setUsingLiveData(true)

        return
      }

      // -----------------------------------------------------
      // Fallback to static data
      // -----------------------------------------------------

      const allStatic = [
        ...thaneFacilities,
        ...staticFacilities.filter(
          f =>
            !thaneFacilities.find(
              t => t.id === f.id
            )
        ),
      ]

      const updated =
        allStatic.map(f => ({
          ...f,
          distance: Number(
            calculateDistance(
              location.latitude,
              location.longitude,
              f.latitude,
              f.longitude
            ).toFixed(2)
          ),
        }))

      const sorted =
        [...updated].sort(
          (a, b) =>
            a.distance - b.distance
        )

      setFacilitiesWithDistance(sorted)
      setNearestFacility(
        sorted[0] ?? null
      )

      setUsingLiveData(false)

    } catch (error) {
      console.error(error)

      setLocationError(
        'Location could not be detected. Please try again.'
      )
    } finally {
      setLocationLoading(false)
    }
  }

  const filtered: Facility[] =
    filter === 'all'
      ? facilitiesWithDistance
      : facilitiesWithDistance.filter(
          f => f.type === filter
        )

  return (
    <div className="min-h-full bg-cream overflow-y-auto">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="bg-forest text-white px-5 pt-4 pb-6">

        <button
          onClick={goBack}
          className="text-green-300 mb-3 flex items-center gap-1 text-sm"
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

        <h2 className="devanagari text-2xl font-bold">
          नजदीकी स्वास्थ्य केंद्र
        </h2>

        <p className="text-green-300 text-sm">
          Nearest Health Facilities
        </p>

        {/* Live data badge */}
        {usingLiveData && (
          <div className="mt-2 inline-flex items-center gap-1.5 bg-green-700/50 border border-green-600 rounded-full px-2.5 py-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />

            <span className="text-green-200 text-[10px] font-bold">
              LIVE DATA FROM SERVER
            </span>
          </div>
        )}

        {/* Location card */}
        <div className="mt-3 bg-white/10 rounded-xl px-3 py-3 border border-white/10">

          <div className="flex items-center gap-2">

            <span className="text-xl">
              📍
            </span>

            <div className="flex-1">

              <p className="devanagari text-white text-sm font-semibold">
                आपकी वर्तमान स्थिति
              </p>

              {userLocation ? (
                <p className="text-green-400 text-xs">
                  {userLocation.latitude.toFixed(4)}
                  °N — Location detected
                </p>
              ) : (
                <p className="text-green-300 text-xs">
                  Location not detected
                </p>
              )}

            </div>

            <div
              className={`w-2 h-2 rounded-full ${
                userLocation
                  ? 'bg-green-400'
                  : 'bg-zinc-400'
              }`}
            />

          </div>

          <button
            onClick={handleGetLocation}
            disabled={locationLoading}
            className="w-full mt-3 bg-white text-forest rounded-xl py-3 text-sm font-bold shadow-sm hover:bg-green-50 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {locationLoading
              ? '📍 Getting location...'
              : '📍 Use My Location'}
          </button>

          {locationError && (
            <div className="mt-2">

              <p className="text-red-300 text-xs">
                ⚠️ {locationError}
              </p>

              <button
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="mt-2 bg-white/15 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-white/25 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                🔄 Try Again
              </button>

            </div>
          )}

        </div>
      </div>

      {/* ===================================================== */}
      {/* NEAREST FACILITY */}
      {/* ===================================================== */}

      {nearestFacility && (
        <div className="mx-5 mt-4 bg-green-50 border border-green-200 rounded-2xl p-4">

          <p className="text-green-700 text-xs font-bold mb-1">
            📍 NEAREST HEALTH FACILITY
          </p>

          <p className="devanagari text-zinc-800 font-bold text-lg">
            {nearestFacility.nameHi}
          </p>

          <p className="text-zinc-500 text-sm">
            {nearestFacility.name}
          </p>

          <p className="text-forest font-black text-xl mt-2">
            {nearestFacility.distance} km away
          </p>

        </div>
      )}

      {/* ===================================================== */}
      {/* FILTERS */}
      {/* ===================================================== */}

      <div className="flex gap-2 px-5 mt-4 overflow-x-auto pb-1">

        {(
          [
            'all',
            'PHC',
            'CHC',
            'District Hospital',
          ] as Filter[]
        ).map(f => (

          <button
            key={f}
            onClick={() =>
              setFilter(f)
            }
            className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
              filter === f
                ? 'bg-forest text-white'
                : 'bg-white text-zinc-500 border border-zinc-200'
            }`}
          >
            {f === 'all'
              ? 'सभी / All'
              : f}
          </button>

        ))}

      </div>

      {/* ===================================================== */}
      {/* FACILITY CARDS */}
      {/* ===================================================== */}

      <div className="px-5 mt-3 pb-8 flex flex-col gap-3">

        {filtered.map(facility => (

          <div key={facility.id}>

            {/* Facility card */}
            <button
              onClick={() =>
                setSelected(
                  selected === facility.id
                    ? null
                    : facility.id
                )
              }
              className="w-full bg-white rounded-2xl border border-cream-dark p-4 text-left hover:shadow-md active:scale-[0.99] transition-all"
            >

              {/* Top row */}
              <div className="flex items-start justify-between mb-2">

                <div className="flex-1 min-w-0">

                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        TYPE_COLORS[
                          facility.type
                        ] ??
                        'bg-zinc-100 text-zinc-600'
                      }`}
                    >
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
                        ? '● OPEN'
                        : '● CLOSED'}
                    </span>

                  </div>

                  <p className="devanagari font-bold text-zinc-800 text-base leading-tight">
                    {facility.nameHi}
                  </p>

                  <p className="text-zinc-400 text-xs">
                    {facility.name}
                  </p>

                </div>

                <div className="text-right ml-4 flex-shrink-0">

                  <p className="text-forest font-black text-2xl leading-none">
                    {facility.distance}
                  </p>

                  <p className="text-zinc-400 text-xs">
                    km
                  </p>

                </div>

              </div>

              {/* Address */}
              <p className="devanagari text-zinc-500 text-xs mb-3 leading-relaxed">
                {facility.addressHi}
              </p>

              {/* Doctors */}
              {facility.doctors.length > 0 && (
                <div className="flex flex-col gap-1.5 border-t border-cream-dark pt-2.5">

                  {facility.doctors.map(doc => (

                    <div
                      key={doc.id}
                      className="flex items-center gap-2"
                    >

                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          doc.isAvailable
                            ? 'bg-emerald-500'
                            : 'bg-zinc-300'
                        }`}
                      />

                      <span className="devanagari text-zinc-700 text-xs font-medium">
                        {doc.nameHi}
                      </span>

                      <span className="text-zinc-300">
                        •
                      </span>

                      <span className="devanagari text-zinc-400 text-xs flex-1">
                        {doc.specializationHi}
                      </span>

                      {doc.isAvailable &&
                        doc.availableUntil && (
                          <span className="text-emerald-600 text-[10px] font-semibold">
                            until{' '}
                            {doc.availableUntil}
                          </span>
                        )}

                    </div>

                  ))}

                </div>
              )}

              {/* Footer */}
              <div className="mt-2.5 flex items-center justify-between">

                <p className="text-zinc-300 text-xs">
                  {facility.phone}
                </p>

                <p
                  className={`text-xs font-medium ${
                    selected === facility.id
                      ? 'text-forest'
                      : 'text-zinc-300'
                  }`}
                >
                  {selected === facility.id
                    ? 'Hide actions ↑'
                    : 'Tap for actions ↓'}
                </p>

              </div>

            </button>

            {/* ================================================= */}
            {/* EXPANDED ACTIONS */}
            {/* ================================================= */}

            {selected === facility.id && (

              <div className="bg-white border border-cream-dark border-t-0 rounded-b-2xl -mt-2 pt-3 px-4 pb-4">

                <div className="flex gap-2">

                  {/* Call */}
                  <a
                    href={`tel:${facility.phone}`}
                    className="flex-1 bg-forest text-white rounded-xl py-3 text-center text-sm font-bold devanagari hover:bg-forest-dark active:scale-[0.97] transition-all"
                  >
                    📞 फ़ोन करें
                  </a>

                  {/* Directions */}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-center text-sm font-bold devanagari hover:bg-blue-700 active:scale-[0.97] transition-all"
                  >
                    🗺️ रास्ता देखें
                  </a>

                </div>

                {/* Referral */}
                <button
                  onClick={() => {
                    setReferralFacility(
                      facility
                    )
                    setReferralMessage(null)
                    setShowReferralModal(
                      true
                    )
                  }}
                  disabled={!usingLiveData}
                  className={`w-full mt-2 rounded-xl py-3 text-sm font-bold transition-all ${
                    usingLiveData
                      ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.97]'
                      : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  📋{' '}
                  {usingLiveData
                    ? 'Refer to this facility'
                    : 'Referral requires live facility data'}
                </button>

              </div>
            )}

          </div>

        ))}

      </div>

      {/* ===================================================== */}
      {/* OFFLINE NOTE */}
      {/* ===================================================== */}

      <div className="px-5 mb-6">

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2">

          <span>
            📴
          </span>

          <p className="text-amber-700 text-xs devanagari">

            {usingLiveData
              ? 'Live data from server. Tap "Use My Location" to refresh.'
              : 'यह सूची ऑफ़लाइन भी काम करती है। Facility list is cached for offline use.'}

          </p>

        </div>

      </div>

      {/* ===================================================== */}
      {/* REFERRAL MODAL */}
      {/* ===================================================== */}

      {showReferralModal &&
        referralFacility && (

          <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">

            <div className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl">

              {/* Handle */}
              <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-5" />

              <h2 className="text-lg font-bold text-zinc-800">
                Create Referral
              </h2>

              <p className="text-zinc-500 text-sm mt-1 mb-4">
                Refer patient to{' '}
                <span className="font-semibold">
                  {referralFacility.name}
                </span>
              </p>

              <div className="flex flex-col gap-3">

                {/* Patient Name */}
                <div>

                  <label className="text-xs font-semibold text-zinc-500 mb-1.5 block uppercase tracking-wide">
                    Patient Name *
                  </label>

                  <input
                    value={patientName}
                    onChange={e =>
                      setPatientName(
                        e.target.value
                      )
                    }
                    placeholder="Enter patient name"
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500"
                  />

                </div>

                {/* Patient Phone */}
                <div>

                  <label className="text-xs font-semibold text-zinc-500 mb-1.5 block uppercase tracking-wide">
                    Patient Phone
                  </label>

                  <input
                    type="tel"
                    inputMode="numeric"
                    value={patientPhone}
                    onChange={e =>
                      setPatientPhone(
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-amber-500"
                  />

                </div>

                {/* Symptoms */}
                <div className="bg-zinc-50 rounded-xl p-3">

                  <p className="text-zinc-400 text-[10px] font-bold uppercase mb-1">
                    Symptoms
                  </p>

                  <p className="text-zinc-600 text-sm">
                    {localStorage.getItem(
                      'symptoms'
                    ) ||
                      'No symptoms recorded'}
                  </p>

                </div>

                {/* Triage */}
                <div className="bg-zinc-50 rounded-xl p-3">

                  <p className="text-zinc-400 text-[10px] font-bold uppercase mb-1">
                    Triage Level
                  </p>

                  <p className="text-zinc-600 text-sm font-semibold">
                    {(() => {
                      const saved =
                        localStorage.getItem(
                          'chatbotResponse'
                        )

                      if (!saved) {
                        return 'Not available'
                      }

                      try {
                        const parsed =
                          JSON.parse(
                            saved
                          )

                        return (
                          parsed.triage ||
                          'Not available'
                        )
                      } catch {
                        return 'Not available'
                      }
                    })()}
                  </p>

                </div>

                {/* Message */}
                {referralMessage && (

                  <div
                    className={`rounded-xl px-4 py-3 ${
                      referralMessage.includes(
                        'successfully'
                      )
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <p
                      className={`text-sm ${
                        referralMessage.includes(
                          'successfully'
                        )
                          ? 'text-green-700'
                          : 'text-red-600'
                      }`}
                    >
                      {referralMessage}
                    </p>
                  </div>

                )}

              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-5">

                <button
                  onClick={() => {
                    setShowReferralModal(
                      false
                    )
                    setReferralFacility(null)
                    setReferralMessage(null)
                  }}
                  disabled={referralLoading}
                  className="flex-1 border border-zinc-200 text-zinc-500 rounded-xl py-3 text-sm font-semibold hover:bg-zinc-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleCreateReferral
                  }
                  disabled={referralLoading}
                  className="flex-1 bg-amber-500 text-white rounded-xl py-3 text-sm font-bold hover:bg-amber-600 disabled:opacity-70"
                >
                  {referralLoading
                    ? 'Creating...'
                    : 'Create Referral'}
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  )
}