import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, and_
from sqlalchemy.orm import Session
from database import get_db
from models import DoctorSchedule, Doctor, Facility, User, UserRole, DoctorStatus
from schemas import (
    DoctorScheduleCreateOrUpdate,
    DoctorScheduleStatusPatch,
    DoctorAvailabilityOut,
    FacilityAvailabilitySummary,
)
from auth import get_current_user, require_roles
from geo import point_wkt

router = APIRouter(prefix="/availability", tags=["Doctor Availability"])


def _today_start():
    now = datetime.datetime.utcnow()
    return datetime.datetime(
        now.year,
        now.month,
        now.day
    )


def _tomorrow_start():
    return _today_start() + datetime.timedelta(days=1)


def _to_availability_out(schedule: DoctorSchedule, distance_km: float = None) -> DoctorAvailabilityOut:
    doctor = schedule.doctor
    facility = doctor.facility
    return DoctorAvailabilityOut(
        schedule_id=schedule.id,
        doctor_id=doctor.id,
        doctor_name=doctor.name,
        specialization=doctor.specialization,
        doctor_phone=doctor.phone_number,
        facility_id=facility.id,
        facility_name=facility.name,
        facility_type=facility.facility_type,
        distance_km=distance_km,
        status=schedule.status,
        expected_arrival_time=schedule.expected_arrival_time,
        expected_departure_time=schedule.expected_departure_time,
        actual_arrival_time=schedule.actual_arrival_time,
        notes=schedule.notes,
        updated_at=schedule.updated_at,
    )


# ---------------------------------------------------------------------------
# Write endpoints — facility staff / admin only
# ---------------------------------------------------------------------------

@router.post("", response_model=DoctorAvailabilityOut, status_code=201)
def set_doctor_availability(
    payload: DoctorScheduleCreateOrUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FACILITY_STAFF, UserRole.ADMIN)),
):
    """
    Create or update *today's* availability record for a doctor.
    If a record for this doctor already exists for today, it's updated
    in place rather than duplicated (idempotent for the day).
    """
    doctor = db.query(Doctor).filter(Doctor.id == payload.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found.")

    if current_user.role == UserRole.FACILITY_STAFF and current_user.facility_id != doctor.facility_id:
        raise HTTPException(
            status_code=403,
            detail="Facility staff can only update availability for their own facility's doctors.",
        )

    existing = (
        db.query(DoctorSchedule)
        .filter(
            DoctorSchedule.doctor_id == doctor.id,
            DoctorSchedule.schedule_date >= _today_start(),
            DoctorSchedule.schedule_date < _tomorrow_start()
            )
        ).first()
    

    if existing:
        existing.expected_arrival_time = payload.expected_arrival_time
        existing.expected_departure_time = payload.expected_departure_time
        existing.actual_arrival_time = payload.actual_arrival_time
        existing.status = payload.status
        existing.notes = payload.notes
        existing.updated_by = current_user.id
        schedule = existing
    else:
        schedule = DoctorSchedule(
            doctor_id=doctor.id,
            expected_arrival_time=payload.expected_arrival_time,
            expected_departure_time=payload.expected_departure_time,
            actual_arrival_time=payload.actual_arrival_time,
            status=payload.status,
            notes=payload.notes,
            updated_by=current_user.id,
        )
        db.add(schedule)

    db.commit()
    db.refresh(schedule)
    return _to_availability_out(schedule)


@router.patch("/{schedule_id}/status", response_model=DoctorAvailabilityOut)
def quick_update_status(
    schedule_id: str,
    payload: DoctorScheduleStatusPatch,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FACILITY_STAFF, UserRole.ADMIN)),
):
    """
    Fast path for the facility dashboard — e.g. one tap to mark a doctor
    'delayed' or log their actual arrival time when they walk in.
    """
    schedule = db.query(DoctorSchedule).filter(DoctorSchedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule record not found.")

    doctor = schedule.doctor
    if current_user.role == UserRole.FACILITY_STAFF and current_user.facility_id != doctor.facility_id:
        raise HTTPException(status_code=403, detail="Not authorized for this facility.")

    schedule.status = payload.status
    if payload.notes is not None:
        schedule.notes = payload.notes
    if payload.actual_arrival_time is not None:
        schedule.actual_arrival_time = payload.actual_arrival_time
    schedule.updated_by = current_user.id

    db.commit()
    db.refresh(schedule)
    return _to_availability_out(schedule)


# ---------------------------------------------------------------------------
# Read endpoints — ASHA workers, villagers, anyone authenticated
# ---------------------------------------------------------------------------

@router.get("/facility/{facility_id}", response_model=List[DoctorAvailabilityOut])
def get_facility_availability(
    facility_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """All doctors and their today's status for one facility."""
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found.")

    schedules = (
        db.query(DoctorSchedule)
        .join(Doctor)
        .filter(
            Doctor.facility_id == facility_id,
            Doctor.is_active.is_(True),
            DoctorSchedule.schedule_date >= _today_start(),
        )
        .all()
    )
    return [_to_availability_out(s) for s in schedules]


@router.get("/nearby", response_model=List[FacilityAvailabilitySummary])
def get_nearby_doctor_availability(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(15, gt=0, le=200),
    only_with_available_doctor: bool = Query(
        False, description="If true, only return facilities that currently have at least one available doctor."
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    THE key ASHA-worker query: 'which nearby facilities currently have a
    doctor, and who / when'. Combines GPS proximity (PostGIS) with today's
    live doctor schedules, nearest facility first.
    """
    origin = func.ST_GeogFromText(point_wkt(latitude, longitude))
    radius_m = radius_km * 1000

    facility_rows = (
        db.query(
            Facility,
            func.ST_Distance(Facility.location, origin).label("distance_m"),
        )
        .filter(Facility.is_active.is_(True))
        .filter(func.ST_DWithin(Facility.location, origin, radius_m))
        .order_by("distance_m")
        .all()
    )

    summaries: List[FacilityAvailabilitySummary] = []
    for facility, distance_m in facility_rows:
        distance_km = round(distance_m / 1000, 2)

        schedules = (
            db.query(DoctorSchedule)
            .join(Doctor)
            .filter(
                Doctor.facility_id == facility.id,
                Doctor.is_active.is_(True),
                DoctorSchedule.schedule_date >= _today_start(),
            )
            .all()
        )

        doctor_availability = [_to_availability_out(s, distance_km=distance_km) for s in schedules]
        has_available = any(d.status == DoctorStatus.AVAILABLE for d in doctor_availability)

        if only_with_available_doctor and not has_available:
            continue

        summaries.append(
            FacilityAvailabilitySummary(
                facility_id=facility.id,
                facility_name=facility.name,
                facility_type=facility.facility_type,
                distance_km=distance_km,
                doctors=doctor_availability,
                has_available_doctor=has_available,
            )
        )

    return summaries