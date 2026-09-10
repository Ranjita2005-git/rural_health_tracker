export type Role = 'villager' | 'asha' | 'admin'

export type Screen =
  | 'splash'
  | 'role-select'
  | 'villager-home'
  | 'symptom-input'
  | 'triage-result'
  | 'phc-locator'
  | 'asha-dashboard'
  | 'log-visit'
  | 'admin-dashboard'
  | 'outbreak-alert'

export interface Doctor {
  id: string
  name: string
  nameHi: string
  specialization: string
  specializationHi: string
  isAvailable: boolean
  availableUntil?: string
}

export interface Facility {
  id: string
  name: string
  nameHi: string
  type: 'PHC' | 'CHC' | 'District Hospital'
  distance: number
  latitude: number
  longitude: number
  address: string
  addressHi: string
  phone: string
  isOpen: boolean
  doctors: Doctor[]
}

export interface Household {
  id: string
  headName: string
  headNameHi: string
  village: string
  members: number
  lastVisit: string
  riskLevel: 'low' | 'medium' | 'high'
  tags: string[]
}
