from datetime import datetime, time
from typing import Optional, List

from pydantic import BaseModel, Field, ConfigDict

from models import UserRole, FacilityType, DoctorStatus,ReferralStatus


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class UserRegister(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=15)
    name: str
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.ASHA_WORKER
    facility_id: Optional[str] = None  # required if role == facility_staff


class UserLogin(BaseModel):
    phone_number: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    name: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    phone_number: str
    name: str
    role: UserRole
    facility_id: Optional[str] = None


# ---------------------------------------------------------------------------
# Facility
# ---------------------------------------------------------------------------

class FacilityCreate(BaseModel):
    name: str
    facility_type: FacilityType
    address: Optional[str] = None
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    phone_number: Optional[str] = None


class FacilityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    facility_type: FacilityType
    address: Optional[str] = None
    phone_number: Optional[str] = None
    latitude: float
    longitude: float
    distance_km: Optional[float] = None  # populated only for "nearby" queries


# ---------------------------------------------------------------------------
# Doctor
# ---------------------------------------------------------------------------

class DoctorCreate(BaseModel):
    name: str
    specialization: str = "General Physician"
    facility_id: str
    phone_number: Optional[str] = None


class DoctorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    specialization: str
    facility_id: str
    phone_number: Optional[str] = None


# ---------------------------------------------------------------------------
# Doctor Schedule / Availability  (the new feature)
# ---------------------------------------------------------------------------

class DoctorScheduleCreateOrUpdate(BaseModel):
    doctor_id: str
    expected_arrival_time: Optional[time] = None
    expected_departure_time: Optional[time] = None
    actual_arrival_time: Optional[time] = None
    status: DoctorStatus = DoctorStatus.AVAILABLE
    notes: Optional[str] = None


class DoctorScheduleStatusPatch(BaseModel):
    """Lightweight patch used for quick status flips, e.g. marking 'delayed'."""
    status: DoctorStatus
    notes: Optional[str] = None
    actual_arrival_time: Optional[time] = None


class DoctorAvailabilityOut(BaseModel):
    """
    The core response shape ASHA workers see: doctor + facility + live status,
    flattened into one object so the mobile app doesn't have to join anything.
    """
    schedule_id: str
    doctor_id: str
    doctor_name: str
    specialization: str
    doctor_phone: Optional[str] = None

    facility_id: str
    facility_name: str
    facility_type: FacilityType
    distance_km: Optional[float] = None

    status: DoctorStatus
    expected_arrival_time: Optional[time] = None
    expected_departure_time: Optional[time] = None
    actual_arrival_time: Optional[time] = None
    notes: Optional[str] = None

    updated_at: datetime


class FacilityAvailabilitySummary(BaseModel):
    """One facility + the list of doctors currently on its roster today."""
    facility_id: str
    facility_name: str
    facility_type: FacilityType
    distance_km: Optional[float] = None
    doctors: List[DoctorAvailabilityOut]
    has_available_doctor: bool

class ReferralCreate(BaseModel):
    patient_name: str
    patient_phone: str | None = None
    facility_id: str
    symptoms: str | None = None
    triage_level: str | None = None
    notes: str | None = None


class ReferralStatusUpdate(BaseModel):
    status: ReferralStatus


class ReferralOut(BaseModel):
    id: str
    patient_name: str
    patient_phone: str | None
    created_by: str | None
    facility_id: str
    symptoms: str | None
    triage_level: str | None
    notes: str | None
    status: ReferralStatus
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True