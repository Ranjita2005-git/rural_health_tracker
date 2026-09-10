import { thaneFacilities } from '../../data/ThaneFacilities';
import { useState } from 'react'
import { useNav } from '../../context/NavContext'
import {
  getCurrentLocation,
  calculateDistance,
} from '../../services/locationService'
import type { Facility } from '../../types'

type Filter = 'all' | 'PHC' | 'CHC' | 'District Hospital'

const TYPE_COLORS: Record<string, string> = {
  PHC: 'bg-green-100 text-green-700',
  CHC: 'bg-blue-100 text-blue-700',
  'District Hospital': 'bg-purple-100 text-purple-700',
}

export default function PHCLocator() {
  const { goBack } = useNav()
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [userLocation, setUserLocation] = useState<{
    latitude: number
    longitude: number
  } | null>(null)

  const [facilitiesWithDistance, setFacilitiesWithDistance] = useState<Facility[]>(thaneFacilities)

  const [nearestFacility, setNearestFacility] =
    useState<Facility | null>(null)

  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const handleGetLocation = async () => {
    setLocationLoading(true)
    setLocationError(null)

    try {
      const location = await getCurrentLocation()

      setUserLocation(location)

      const updatedFacilities = thaneFacilities.map((facility) => {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          facility.latitude,
          facility.longitude
        )

        return {
          ...facility,
          distance: Number(distance.toFixed(2)),
        }
      })

      const sortedFacilities = [...updatedFacilities].sort(
        (a, b) => a.distance - b.distance
      )

      setFacilitiesWithDistance(sortedFacilities)

      const nearest = sortedFacilities.reduce(
        (nearest, facility) =>
          facility.distance < nearest.distance ? facility : nearest
      )

      setNearestFacility(nearest)

    } catch (error) {
      console.error(error)

      setLocationError('Location could not be detected. Please try again.')

    } finally {
      setLocationLoading(false)
    }
  }
  const filtered: Facility[] =
    filter === 'all'
      ? facilitiesWithDistance
      : facilitiesWithDistance.filter((f) => f.type === filter)

  return (
    <div className="min-h-full bg-cream overflow-y-auto">
      {/* Header */}
      <div className="bg-forest text-white px-5 pt-4 pb-6">
        <button onClick={goBack} className="text-green-300 mb-3 flex items-center gap-1 text-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h2 className="devanagari text-2xl font-bold">नजदीकी स्वास्थ्य केंद्र</h2>
        <p className="text-green-300 text-sm">Nearest Health Facilities</p>
        <div className="mt-3 bg-white/10 rounded-xl px-3 py-3 border border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>

            <div className="flex-1">
              <p className="devanagari text-white text-sm font-semibold">
                आपकी वर्तमान स्थिति
              </p>

              {userLocation ? (
                <p className="text-green-400 text-xs">
                  Location detected
                </p>
              ) : (
                <p className="text-green-300 text-xs">
                  Location not detected
                </p>
              )}
            </div>

            <div className="w-2 h-2 bg-zinc-400 rounded-full" />
          </div>

          <button
            onClick={handleGetLocation}
            disabled={locationLoading}
            className="w-full mt-3 bg-white text-forest rounded-xl py-3 text-sm font-bold shadow-sm hover:bg-green-50 active:scale-[0.98] transition-all disabled:opacity-70"
          >
            {locationLoading ? '📍 Getting location...' : '📍 Use My Location'}
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
      {/* Filters */}
      <div className="flex gap-2 px-5 mt-4 overflow-x-auto pb-1">
        {(['all', 'PHC', 'CHC', 'District Hospital'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${filter === f
              ? 'bg-forest text-white'
              : 'bg-white text-zinc-500 border border-zinc-200'
              }`}
          >
            {f === 'all' ? 'सभी / All' : f}
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
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${facility.isOpen
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-600'
                        }`}
                    >
                      {facility.isOpen ? '● OPEN' : '● CLOSED'}
                    </span>
                  </div>
                  <p className="devanagari font-bold text-zinc-800 text-base leading-tight">{facility.nameHi}</p>
                  <p className="text-zinc-400 text-xs">{facility.name}</p>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="text-forest font-black text-2xl leading-none">{facility.distance}</p>
                  <p className="text-zinc-400 text-xs">km</p>
                </div>
              </div>

              <p className="devanagari text-zinc-500 text-xs mb-3 leading-relaxed">{facility.addressHi}</p>

              {/* Doctors */}
              <div className="flex flex-col gap-1.5 border-t border-cream-dark pt-2.5">
                {facility.doctors.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${doc.isAvailable ? 'bg-emerald-500' : 'bg-zinc-300'
                        }`}
                    />
                    <span className="devanagari text-zinc-700 text-xs font-medium">{doc.nameHi}</span>
                    <span className="text-zinc-300">•</span>
                    <span className="devanagari text-zinc-400 text-xs flex-1">{doc.specializationHi}</span>
                    {doc.isAvailable && doc.availableUntil && (
                      <span className="text-emerald-600 text-[10px] font-semibold">until {doc.availableUntil}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-2.5 flex items-center justify-between">
                <p className="text-zinc-300 text-xs">{facility.phone}</p>
                <p className={`text-xs font-medium ${selected === facility.id ? 'text-forest' : 'text-zinc-300'}`}>
                  {selected === facility.id ? 'Hide actions ↑' : 'Tap for actions ↓'}
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
                  📞 फ़ोन करें
                </a>
                <button className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-center text-sm font-bold devanagari hover:bg-blue-700 active:scale-[0.97] transition-all">
                  🗺️ रास्ता देखें
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
            यह सूची ऑफ़लाइन भी काम करती है। Facility list is cached for offline use.
          </p>
        </div>
      </div>
    </div>
  )
}
