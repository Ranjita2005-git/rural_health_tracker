import enum
import uuid

from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    Time,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geography

from database import Base


def gen_uuid():
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class UserRole(str, enum.Enum):
    ASHA_WORKER = "asha_worker"
    FACILITY_STAFF = "facility_staff"   # can update doctor availability
    ADMIN = "admin"
    VILLAGER = "villager"               # read-only access to availability


class FacilityType(str, enum.Enum):
    PHC = "PHC"
    CHC = "CHC"
    DISTRICT_HOSPITAL = "district_hospital"
    SUB_CENTRE = "sub_centre"


class DoctorStatus(str, enum.Enum):
    AVAILABLE = "available"       # physically present at the facility now
    DELAYED = "delayed"           # expected but running late
    ON_LEAVE = "on_leave"
    OFF_DUTY = "off_duty"         # outside working hours today

class ReferralStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"
# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    phone_number = Column(String(15), unique=True, nullable=False, index=True)
    name = Column(String(120), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.ASHA_WORKER)

    # Facility staff are tied to the facility they administer (nullable for
    # ASHA workers / villagers / admins who aren't facility-bound).
    facility_id = Column(UUID(as_uuid=False), ForeignKey("facilities.id"), nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    facility = relationship("Facility", back_populates="staff")


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(200), nullable=False)
    facility_type = Column(Enum(FacilityType), nullable=False)
    address = Column(Text, nullable=True)

    # PostGIS geography point (longitude, latitude) — SRID 4326 = WGS84 GPS.
    location = Column(Geography(geometry_type="POINT", srid=4326), nullable=False)

    phone_number = Column(String(15), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    staff = relationship("User", back_populates="facility")
    doctors = relationship("Doctor", back_populates="facility", cascade="all, delete-orphan")


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String(150), nullable=False)
    specialization = Column(String(120), nullable=False, default="General Physician")
    facility_id = Column(UUID(as_uuid=False), ForeignKey("facilities.id"), nullable=False)
    phone_number = Column(String(15), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    facility = relationship("Facility", back_populates="doctors")
    schedules = relationship(
        "DoctorSchedule", back_populates="doctor", cascade="all, delete-orphan"
    )


class DoctorSchedule(Base):
    """
    Live, day-specific availability record for a doctor at their facility.
    Facility staff update this; ASHA workers / villagers only read it.
    One row per doctor per calendar date (created fresh each day, or
    patched intraday when status changes — e.g. marked 'delayed').
    """

    __tablename__ = "doctor_schedules"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    doctor_id = Column(UUID(as_uuid=False), ForeignKey("doctors.id"), nullable=False)

    schedule_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    expected_arrival_time = Column(Time, nullable=True)
    expected_departure_time = Column(Time, nullable=True)
    actual_arrival_time = Column(Time, nullable=True)

    status = Column(Enum(DoctorStatus), nullable=False, default=DoctorStatus.AVAILABLE)
    notes = Column(Text, nullable=True)  # e.g. "delayed due to district meeting"

    updated_by = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    doctor = relationship("Doctor", back_populates="schedules")

class Referral(Base):
    """
    Referral created when a villager/ASHA needs care at a health facility.
    Tracks the referral from creation through completion.
    """

    __tablename__ = "referrals"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)

    # Patient information
    patient_name = Column(String(120), nullable=False)
    patient_phone = Column(String(15), nullable=True)

    # Who created the referral
    created_by = Column(
        UUID(as_uuid=False),
        ForeignKey("users.id"),
        nullable=True
    )

    # Destination facility
    facility_id = Column(
        UUID(as_uuid=False),
        ForeignKey("facilities.id"),
        nullable=False
    )

    # Reason for referral
    symptoms = Column(Text, nullable=True)
    triage_level = Column(String(30), nullable=True)
    notes = Column(Text, nullable=True)

    # Current referral state
    status = Column(
        Enum(ReferralStatus),
        nullable=False,
        default=ReferralStatus.PENDING
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    creator = relationship("User")
    facility = relationship("Facility")