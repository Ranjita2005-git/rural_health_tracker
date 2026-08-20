from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Doctor, Facility, User, UserRole
from schemas import DoctorCreate, DoctorOut
from auth import get_current_user, require_roles

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.post("", response_model=DoctorOut, status_code=201)
def create_doctor(
    payload: DoctorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.FACILITY_STAFF)),
):
    """Admin or the facility's own staff can add a doctor to a facility's roster."""
    facility = db.query(Facility).filter(Facility.id == payload.facility_id).first()
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found.")

    if current_user.role == UserRole.FACILITY_STAFF and current_user.facility_id != facility.id:
        raise HTTPException(
            status_code=403, detail="Facility staff can only add doctors to their own facility."
        )

    doctor = Doctor(
        name=payload.name,
        specialization=payload.specialization,
        facility_id=payload.facility_id,
        phone_number=payload.phone_number,
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor


@router.get("/facility/{facility_id}", response_model=List[DoctorOut])
def list_doctors_for_facility(
    facility_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doctors = (
        db.query(Doctor)
        .filter(Doctor.facility_id == facility_id, Doctor.is_active.is_(True))
        .all()
    )
    return doctors