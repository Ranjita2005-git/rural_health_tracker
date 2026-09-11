/**
 * Centralised API service for Rural Nivaran.
 *
 * All backend calls go through `apiFetch`.  Token is stored in localStorage
 * under the key `rn_token` so it survives page refreshes.
 *
 * Every exported function gracefully returns `null` (or an empty array) when
 * the server is unreachable, letting callers fall back to static data.
 */

export const API_BASE = 'http://localhost:8000'

const TOKEN_KEY = 'rn_token'

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// ---------------------------------------------------------------------------
// Core fetcher
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    })

    if (!res.ok) {
      console.warn(`[API] ${options.method ?? 'GET'} ${path} → ${res.status}`)
      return null
    }

    return (await res.json()) as T
  } catch (err) {
    // Network error — backend not running or offline
    console.warn(`[API] unreachable: ${path}`, err)
    return null
  }
}

// ---------------------------------------------------------------------------
// Types mirroring backend schemas
// ---------------------------------------------------------------------------

export interface LoginResult {
  access_token: string
  token_type: string
  role: 'villager' | 'asha_worker' | 'facility_staff' | 'admin'
  name: string
}
export interface RegisterPayload {
  phone_number: string
  name: string
  password: string
  role: 'villager' | 'asha_worker' | 'facility_staff' | 'admin'
  facility_id?: string
}

export interface UserOut {
  id: string
  phone_number: string
  name: string
  role: 'villager' | 'asha_worker' | 'facility_staff' | 'admin'
  facility_id: string | null
}

export interface ApiDoctor {
  id: string
  name: string
  specialization: string
  facility_id: string
  phone_number: string | null
}

export interface DoctorSchedulePayload {
  doctor_id: string
  status: 'available' | 'delayed' | 'on_leave' | 'off_duty'
  expected_arrival_time?: string | null   // "HH:MM:SS"
  expected_departure_time?: string | null
  actual_arrival_time?: string | null
  notes?: string | null
}

export interface FacilityCreatePayload {
  name: string
  facility_type: 'PHC' | 'CHC' | 'district_hospital' | 'sub_centre'
  address?: string
  latitude: number
  longitude: number
  phone_number?: string
}

export interface ApiFacility {
  id: string
  name: string
  facility_type: 'PHC' | 'CHC' | 'district_hospital' | 'sub_centre'
  address: string | null
  phone_number: string | null
  latitude: number
  longitude: number
  distance_km: number | null
}

export interface ApiDoctorAvailability {
  schedule_id: string
  doctor_id: string
  doctor_name: string
  specialization: string
  doctor_phone: string | null
  facility_id: string
  facility_name: string
  facility_type: string
  distance_km: number | null
  status: 'available' | 'delayed' | 'on_leave' | 'off_duty'
  expected_arrival_time: string | null
  expected_departure_time: string | null
  actual_arrival_time: string | null
  notes: string | null
  updated_at: string
}

export interface ApiFacilityAvailabilitySummary {
  facility_id: string
  facility_name: string
  facility_type: string
  distance_km: number | null
  doctors: ApiDoctorAvailability[]
  has_available_doctor: boolean
}

export interface ApiChatResponse {
  role: string
  message_hi: string
  message_en: string
  disease: string | null
  disease_name_hi: string | null
  disease_name_en: string | null
  triage: 'home' | 'phc' | 'urgent' | null
  triage_label_hi: string | null
  triage_label_en: string | null
  steps_hi: string[]
  steps_en: string[]
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/**
 * Login with phone number + password (OAuth2 form).
 * Returns the token payload on success, null on failure.
 */
export async function login(
  phoneNumber: string,
  password: string
): Promise<LoginResult | null> {
  // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
  const body = new URLSearchParams({
    username: phoneNumber,
    password,
  })

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!res.ok) return null
    return (await res.json()) as LoginResult
  } catch {
    return null
  }
}

export async function registerUser(
  payload: RegisterPayload
): Promise<UserOut | null> {
  return apiFetch<UserOut>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Fetch the current authenticated user's profile.
 */
export async function getMe(): Promise<UserOut | null> {
  return apiFetch<UserOut>('/auth/me')
}

// ---------------------------------------------------------------------------
// Facilities
// ---------------------------------------------------------------------------

/**
 * Fetch facilities within `radiusKm` of the given GPS position.
 * Requires a valid token (any role).
 */
export async function getNearbyFacilities(
  latitude: number,
  longitude: number,
  radiusKm = 30
): Promise<ApiFacility[] | null> {
  return apiFetch<ApiFacility[]>(
    `/facilities/nearby?latitude=${latitude}&longitude=${longitude}&radius_km=${radiusKm}`
  )
}

// ---------------------------------------------------------------------------
// Doctor Availability
// ---------------------------------------------------------------------------

/**
 * Fetch today's availability summary for all facilities near a GPS point.
 */
export async function getNearbyAvailability(
  latitude: number,
  longitude: number,
  radiusKm = 30
): Promise<ApiFacilityAvailabilitySummary[] | null> {
  return apiFetch<ApiFacilityAvailabilitySummary[]>(
    `/availability/nearby?latitude=${latitude}&longitude=${longitude}&radius_km=${radiusKm}`
  )
}

/**
 * Fetch today's schedule list for a single facility.
 */
export async function getFacilityAvailability(
  facilityId: string
): Promise<ApiDoctorAvailability[] | null> {
  return apiFetch<ApiDoctorAvailability[]>(`/availability/facility/${facilityId}`)
}

/**
 * Quick-patch a doctor's status (facility staff / admin only).
 */
export async function patchDoctorStatus(
  scheduleId: string,
  status: ApiDoctorAvailability['status'],
  notes?: string
): Promise<ApiDoctorAvailability | null> {
  return apiFetch<ApiDoctorAvailability>(`/availability/${scheduleId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, notes }),
  })
}
export async function setDoctorAvailability(
  payload: DoctorSchedulePayload
): Promise<ApiDoctorAvailability | null> {
  return apiFetch<ApiDoctorAvailability>('/availability', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ---------------------------------------------------------------------------
// Doctors
// ---------------------------------------------------------------------------

/**
 * List all active doctors for a facility.
 */
export async function getDoctorsForFacility(
  facilityId: string
): Promise<ApiDoctor[] | null> {
  return apiFetch<ApiDoctor[]>(`/doctors/facility/${facilityId}`)
}

/**
 * Add a new doctor to a facility (admin / facility_staff only).
 */
export async function createDoctor(payload: {
  name: string
  specialization: string
  facility_id: string
  phone_number?: string
}): Promise<ApiDoctor | null> {
  return apiFetch<ApiDoctor>('/doctors', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ---------------------------------------------------------------------------
// Facility management (admin only)
// ---------------------------------------------------------------------------

/**
 * Register a new PHC / CHC / district hospital (admin only).
 */
export async function createFacility(
  payload: FacilityCreatePayload
): Promise<ApiFacility | null> {
  return apiFetch<ApiFacility>('/facilities', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}


// ---------------------------------------------------------------------------
// AI Chatbot
// ---------------------------------------------------------------------------

/**
 * Send a message to the disease-recognition chatbot.
 * Falls back gracefully when the server is unreachable (null → component uses
 * its local offline engine).
 */
export async function sendChatMessage(
  message: string,
  lang = 'hi'
): Promise<ApiChatResponse | null> {
  return apiFetch<ApiChatResponse>('/chat/message', {
    method: 'POST',
    body: JSON.stringify({ message, lang }),
  })
}
