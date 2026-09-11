import { useState, useEffect } from 'react'
import { useNav } from '../../context/NavContext'
import { useAuth } from '../../context/AuthContext'
import { facilities } from '../../data'
import type { Doctor } from '../../types'
import {
  getFacilityAvailability,
  patchDoctorStatus,
  createDoctor,
  setDoctorAvailability,
  getDoctorsForFacility,
  type ApiDoctorAvailability,
  type ApiDoctor,
} from '../../services/api'

type Tab = 'doctors' | 'referrals' | 'stats'

const REFERRALS = [
  {
    id: 'r1',
    patient: 'Ramesh Yadav',
    from: 'Villager App',
    condition: 'High fever, vomiting, 3 days',
    urgent: true,
    time: '10:32 AM',
  },
  {
    id: 'r2',
    patient: 'Kamla Bai',
    from: 'ASHA Worker',
    condition: 'Diabetes follow-up',
    urgent: false,
    time: '9:15 AM',
  },
  {
    id: 'r3',
    patient: 'Sunita Devi',
    from: 'ASHA Worker',
    condition: 'Pregnancy check — 8th month',
    urgent: true,
    time: '8:50 AM',
  },
]

const STATS = [
  {
    label: 'OPD Patients',
    value: 134,
    max: 200,
    color: 'bg-blue-600',
  },
  {
    label: 'Referrals Received',
    value: 12,
    max: 30,
    color: 'bg-terra',
  },
  {
    label: 'Deliveries',
    value: 3,
    max: 10,
    color: 'bg-pink-500',
  },
  {
    label: 'Vaccinations',
    value: 47,
    max: 60,
    color: 'bg-emerald-600',
  },
]



interface AddDoctorModalProps {
  facilityId: string
  onClose: () => void
  onCreated: (doc: Doctor) => void
}

function AddDoctorModal({ facilityId, onClose, onCreated }: AddDoctorModalProps) {
  const [form, setForm] = useState({
    name: '',
    specialization: 'General Physician',
    phone: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Doctor name is required.')
      return
    }
    setSaving(true)
    setError(null)

    const result = await createDoctor({
      name: form.name.trim(),
      specialization: form.specialization.trim() || 'General Physician',
      facility_id: facilityId,
      phone_number: form.phone.trim() || undefined,
    })

    if (!result) {
      setError('Failed to create doctor. Check your connection or permissions.')
      setSaving(false)
      return
    }

    // Immediately mark them available for today
    await setDoctorAvailability({
      doctor_id: result.id,
      status: 'available',
    })

    // Map ApiDoctor → frontend Doctor type
    const frontendDoc: Doctor = {
      id: result.id,
      name: result.name,
      nameHi: result.name,
      specialization: result.specialization,
      specializationHi: result.specialization,
      isAvailable: true,
    }

    onCreated(frontendDoc)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
      <div className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl">

        <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-5" />

        <h2 className="text-lg font-bold text-zinc-800 mb-4">Add Doctor to Roster</h2>

        <div className="flex flex-col gap-3">

          <div>
            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block uppercase tracking-wide">
              Doctor Name *
            </label>
            <input
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Dr. Priya Sharma"
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block uppercase tracking-wide">
              Specialization
            </label>
            <input
              value={form.specialization}
              onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))}
              placeholder="General Physician"
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block uppercase tracking-wide">
              Phone Number (optional)
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="e.g. 9876543210"
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border border-zinc-200 text-zinc-500 rounded-xl py-3 text-sm font-semibold hover:bg-zinc-50 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : '+ Add & Mark Available'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default function PHCAdmin() {
  const { navigate } = useNav()
  const { user, signOut } = useAuth()

  const phc = facilities[0]
  const facilityId = user?.facilityId ?? phc.id

  const [doctors, setDoctors] = useState<Doctor[]>(
    phc.doctors.map((d) => ({ ...d }))
  )

  const [beds, setBeds] = useState({
    total: 20,
    occupied: 14,
  })

  const [tab, setTab] = useState<Tab>('doctors')

  const [referralStatus, setReferralStatus] = useState<
    Record<string, 'pending' | 'accepted' | 'redirected'>
  >({
    r1: 'pending',
    r2: 'pending',
    r3: 'pending',
  })

  // Map of doctor_id → schedule_id for live PATCH calls
  const [scheduleMap, setScheduleMap] = useState<Record<string, string>>({})
  const [liveMode, setLiveMode] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  // On mount, try to load live availability for the first facility
  useEffect(() => {
    getFacilityAvailability(facilityId).then(schedules => {
     if (!schedules || schedules.length === 0) {
        // No live schedules yet — try fetching the doctor roster directly
        getDoctorsForFacility(facilityId).then((liveDoctors: ApiDoctor[] | null) => {
          if (!liveDoctors || liveDoctors.length === 0) return
          setDoctors(liveDoctors.map(d => ({
            id: d.id,
            name: d.name,
            nameHi: d.name,
            specialization: d.specialization,
            specializationHi: d.specialization,
            isAvailable: false,
          })))
        })
        return
      }
      setLiveMode(true)

      // Update doctor availability from live schedule
      const map: Record<string, string> = {}
      const liveDoctorList: Doctor[] = schedules.map((sched: ApiDoctorAvailability) => {
        map[sched.doctor_id] = sched.schedule_id
        return {
          id: sched.doctor_id,
          name: sched.doctor_name,
          nameHi: sched.doctor_name,
          specialization: sched.specialization,
          specializationHi: sched.specialization,
          isAvailable: sched.status === 'available',
          availableUntil: sched.expected_departure_time
            ? String(sched.expected_departure_time)
            : undefined,
        }
      })
      setDoctors(liveDoctorList)
      setScheduleMap(map)
    })
  }, [facilityId])

  const toggleDoc = async (id: string) => {
    const doc = doctors.find(d => d.id === id)
    if (!doc) return

    const newAvailable = !doc.isAvailable

    // Optimistic UI update first
    setDoctors(prev =>
      prev.map(d => d.id === id ? { ...d, isAvailable: newAvailable } : d)
    )

    // If we have a live schedule, patch it on the server
    const scheduleId = scheduleMap[id]
    if (liveMode && scheduleId) {
      const newStatus = newAvailable ? 'available' : 'off_duty'
      const result = await patchDoctorStatus(scheduleId, newStatus)
      if (!result) {
        // Server rejected — revert
        setDoctors(prev =>
          prev.map(d => d.id === id ? { ...d, isAvailable: doc.isAvailable } : d)
        )
      }
    } else if (!scheduleId) {
      // No schedule yet — create one via setDoctorAvailability
      const newStatus = newAvailable ? 'available' : 'off_duty'
      const result = await setDoctorAvailability({ doctor_id: id, status: newStatus })
      if (result) {
        setLiveMode(true)
        setScheduleMap(prev => ({ ...prev, [id]: result.schedule_id }))
      }
    }
  }

  const handleDoctorCreated = (doc: Doctor) => {
    setDoctors(prev => [...prev, doc])
    setShowAddModal(false)
  }

  return (
    <div className="min-h-full bg-cream overflow-y-auto">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="bg-blue-700 text-white px-5 pt-4 pb-6">

        <div className="flex items-center justify-between mb-4">

          <div>
            <p className="text-blue-200 text-xs font-medium">
              PHC Administrator
            </p>

            <h1 className="text-xl font-bold leading-tight">
              {phc.name}
            </h1>

            <p className="text-blue-300 text-xs">
              Admin Dashboard
              {user?.name ?? 'Admin Dashboard'}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">

            <div className="flex items-center gap-2">
              <div className="bg-emerald-400 text-emerald-900 text-[10px] font-black px-2.5 py-1 rounded-full">
                ● OPEN
              </div>
              {liveMode && (
                <div className="bg-green-300/30 border border-green-300/50 text-green-100 text-[9px] font-bold px-2 py-0.5 rounded-full">
                  LIVE
                </div>
              )}
            </div>

            <p className="text-blue-300 text-xs">
              OPD: 9AM–2PM
            </p>
            <button
              onClick={signOut}
              className="text-blue-300 text-[10px] font-semibold hover:text-white transition-colors"
            >
              Sign Out
            </button>

          </div>

        </div>

        {/* Dashboard Summary */}
        <div className="grid grid-cols-3 gap-2">

          {[
            {
              n: `${beds.occupied}/${beds.total}`,
              label: 'Beds\nOccupied',
              bg: 'bg-white/15',
            },
            {
              n: String(
                doctors.filter((d) => d.isAvailable).length
              ),
              label: 'Doctors\nAvailable',
              bg: 'bg-emerald-500/40',
            },
            {
              n: String(
                Object.values(referralStatus).filter(
                  (s) => s === 'pending'
                ).length
              ),
              label: 'Referrals\nPending',
              bg: 'bg-amber-400/40',
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

      {/* ========================= */}
      {/* OUTBREAK ALERT */}
      {/* ========================= */}

      <div className="px-5 mt-4">

        <button
          onClick={() => navigate('outbreak-alert')}
          className="w-full bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-2 text-left hover:bg-red-100 active:scale-[0.98] transition-all"
        >

          <span className="text-xl">
            🚨
          </span>

          <div className="flex-1">

            <p className="text-red-700 font-bold text-sm">
              Ward 3 Outbreak Alert
            </p>

            <p className="text-red-500 text-xs">
              Dengue cluster — action required
            </p>

          </div>

          <svg
            className="w-4 h-4 text-red-400"
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

      {/* ========================= */}
      {/* TABS */}
      {/* ========================= */}

      <div className="flex px-5 mt-4 gap-2">

        {[
          ['doctors', '👨‍⚕️ Doctors'],
          ['referrals', '📋 Referrals'],
          ['stats', '📊 Stats'],
        ].map(([tabValue, label]) => (

          <button
            key={tabValue}
            onClick={() => setTab(tabValue as Tab)}
            className={`flex-1 text-xs py-2.5 rounded-xl font-bold transition-all ${
              tab === tabValue
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white text-zinc-500 border border-zinc-200'
            }`}
          >
            {label}
          </button>

        ))}

      </div>

      <div className="px-5 mt-4 pb-8">

        {/* ================================================= */}
        {/* DOCTORS TAB */}
        {/* ================================================= */}

        {tab === 'doctors' && (

          <div className="flex flex-col gap-3">

            {/* Roster Header */}
            <div className="flex items-center justify-between">

              <h3 className="font-bold text-zinc-800">
                Today's Roster
              </h3>

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-bold hover:bg-blue-700 active:scale-[0.97] transition-all"
              >
                + Add Doctor
              </button>

            </div>

            {/* Doctors */}
            {doctors.map((doc) => (

              <div
                key={doc.id}
                className="bg-white rounded-xl border border-cream-dark p-4"
              >

                <div className="flex items-center gap-3">

                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-blue-100">
                    👨‍⚕️
                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="font-bold text-zinc-800 leading-tight">
                      {doc.name}
                    </p>

                    <p className="text-zinc-500 text-xs">
                      {doc.specialization}
                    </p>

                    {doc.isAvailable && doc.availableUntil ? (

                      <p className="text-emerald-600 text-xs font-medium mt-0.5">
                        Available until {doc.availableUntil}
                      </p>

                    ) : (

                      <p className="text-zinc-400 text-xs mt-0.5">
                        Not available today
                      </p>

                    )}

                  </div>

                  <div className="flex flex-col items-end gap-1.5">

                    <button
                      onClick={() => toggleDoc(doc.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        doc.isAvailable
                          ? 'bg-emerald-500'
                          : 'bg-zinc-300'
                      }`}
                    >

                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                          doc.isAvailable
                            ? 'left-6'
                            : 'left-0.5'
                        }`}
                      />

                    </button>

                    <p
                      className={`text-[10px] font-bold ${
                        doc.isAvailable
                          ? 'text-emerald-600'
                          : 'text-zinc-400'
                      }`}
                    >
                      {doc.isAvailable
                        ? 'Available'
                        : 'Unavailable'}
                    </p>

                  </div>

                </div>

              </div>

            ))}

            {/* ========================= */}
            {/* BED MANAGEMENT */}
            {/* ========================= */}

            <div className="bg-white rounded-xl border border-cream-dark p-4 mt-1">

              <div className="flex items-center justify-between mb-3">

                <div>

                  <p className="font-bold text-zinc-800">
                    Bed Availability
                  </p>

                  <p className="text-zinc-400 text-xs">
                    Current bed occupancy
                  </p>

                </div>

                <p className="font-black text-zinc-700 text-xl">

                  {beds.occupied}

                  <span className="text-zinc-300 font-normal text-base">
                    /{beds.total}
                  </span>

                </p>

              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-zinc-100 rounded-full overflow-hidden mb-3">

                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{
                    width: `${(beds.occupied / beds.total) * 100}%`,
                  }}
                />

              </div>

              {/* Bed Buttons */}
              <div className="flex gap-2">

                <button
                  onClick={() =>
                    setBeds((b) => ({
                      ...b,
                      occupied: Math.min(
                        b.total,
                        b.occupied + 1
                      ),
                    }))
                  }
                  className="flex-1 bg-blue-100 text-blue-700 rounded-xl py-2.5 text-sm font-bold hover:bg-blue-200 active:scale-[0.97] transition-all"
                >
                  + Occupy Bed
                </button>

                <button
                  onClick={() =>
                    setBeds((b) => ({
                      ...b,
                      occupied: Math.max(
                        0,
                        b.occupied - 1
                      ),
                    }))
                  }
                  className="flex-1 bg-zinc-100 text-zinc-600 rounded-xl py-2.5 text-sm font-bold hover:bg-zinc-200 active:scale-[0.97] transition-all"
                >
                  − Free Bed
                </button>

              </div>

            </div>

          </div>

        )}

        {/* ================================================= */}
        {/* REFERRALS TAB */}
        {/* ================================================= */}

        {tab === 'referrals' && (

          <div className="flex flex-col gap-3">

            <h3 className="font-bold text-zinc-800">
              Today's Referrals
            </h3>

            {REFERRALS.map((r) => (

              <div
                key={r.id}
                className={`bg-white rounded-xl border border-cream-dark p-4 border-l-4 ${
                  r.urgent
                    ? 'border-l-red-500'
                    : 'border-l-amber-400'
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

                      <span className="text-zinc-400 text-xs">
                        {r.time}
                      </span>

                    </div>

                    <p className="font-bold text-zinc-800">
                      {r.patient}
                    </p>

                    <p className="text-zinc-500 text-sm">
                      {r.condition}
                    </p>

                  </div>

                  <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                    {r.from}
                  </span>

                </div>

                {/* Referral Actions */}
                {referralStatus[r.id] === 'pending' ? (

                  <div className="flex gap-2 mt-2">

                    <button
                      onClick={() =>
                        setReferralStatus((p) => ({
                          ...p,
                          [r.id]: 'accepted',
                        }))
                      }
                      className="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-emerald-600 active:scale-[0.97] transition-all"
                    >
                      ✓ Accept
                    </button>

                    <button
                      onClick={() =>
                        setReferralStatus((p) => ({
                          ...p,
                          [r.id]: 'redirected',
                        }))
                      }
                      className="flex-1 bg-zinc-100 text-zinc-600 rounded-xl py-2.5 text-xs font-bold hover:bg-zinc-200 active:scale-[0.97] transition-all"
                    >
                      Redirect
                    </button>

                  </div>

                ) : (

                  <div
                    className={`mt-2 rounded-xl py-2.5 text-center text-xs font-bold ${
                      referralStatus[r.id] === 'accepted'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {referralStatus[r.id] === 'accepted'
                      ? '✓ Accepted'
                      : 'Redirected'}
                  </div>

                )}

              </div>

            ))}

          </div>

        )}

        {/* ================================================= */}
        {/* STATS TAB */}
        {/* ================================================= */}

        {tab === 'stats' && (

          <div className="flex flex-col gap-3">

            <div className="flex items-center justify-between">

              <h3 className="font-bold text-zinc-800">
                Weekly Report
              </h3>

              <span className="text-zinc-400 text-xs">
                12–19 Aug 2026
              </span>

            </div>

            {STATS.map((s) => (

              <div
                key={s.label}
                className="bg-white rounded-xl border border-cream-dark p-4"
              >

                <div className="flex items-center justify-between mb-2">

                  <div>

                    <p className="font-bold text-zinc-800 text-sm">
                      {s.label}
                    </p>

                    <p className="text-zinc-400 text-xs">
                      Weekly count
                    </p>

                  </div>

                  <p className="font-black text-zinc-700 text-xl">

                    {s.value}

                    <span className="text-zinc-300 font-normal text-sm">
                      /{s.max}
                    </span>

                  </p>

                </div>

                {/* Progress Bar */}
                <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">

                  <div
                    className={`h-full ${s.color} rounded-full transition-all`}
                    style={{
                      width: `${(s.value / s.max) * 100}%`,
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        )}

      </div>
      {/* ========================= */}
      {/* ADD DOCTOR MODAL */}
      {/* ========================= */}

      {showAddModal && (
        <AddDoctorModal
          facilityId={facilityId}
          onClose={() => setShowAddModal(false)}
          onCreated={handleDoctorCreated}
        />
      )}

    </div>
  )
}
