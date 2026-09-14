from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import Referral, ReferralStatus, User, UserRole, Facility
from auth import get_optional_current_user, get_current_user, require_roles
from schemas import ReferralCreate, ReferralOut, ReferralStatusUpdate


router = APIRouter(
    prefix="/referrals",
    tags=["Referrals"],
)


# ---------------------------------------------------------
# Create a referral
# ---------------------------------------------------------

@router.post(
    "",
    response_model=ReferralOut,
    status_code=status.HTTP_201_CREATED,
)
def create_referral(
    payload: ReferralCreate,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    facility = (
        db.query(Facility)
        .filter(
            Facility.id == payload.facility_id,
            Facility.is_active.is_(True),
        )
        .first()
    )

    if not facility:
        raise HTTPException(
            status_code=404,
            detail="Facility not found.",
        )

    referral = Referral(
        patient_name=payload.patient_name,
        patient_phone=payload.patient_phone,
        created_by=current_user.id if current_user else None,
        facility_id=payload.facility_id,
        symptoms=payload.symptoms,
        triage_level=payload.triage_level,
        notes=payload.notes,
        status=ReferralStatus.PENDING,
    )

    db.add(referral)
    db.commit()
    db.refresh(referral)

    return referral

# ---------------------------------------------------------
# Get referrals for current user
# ---------------------------------------------------------

@router.get(
    "/my",
    response_model=List[ReferralOut],
)
def get_my_referrals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    referrals = (
        db.query(Referral)
        .filter(Referral.created_by == current_user.id)
        .order_by(Referral.created_at.desc())
        .all()
    )

    return referrals


# ---------------------------------------------------------
# Get referrals for a facility
# ---------------------------------------------------------

@router.get(
    "/facility/{facility_id}",
    response_model=List[ReferralOut],
)
def get_facility_referrals(
    facility_id: str,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    if (
        current_user.role == UserRole.FACILITY_STAFF
        and current_user.facility_id != facility_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only view referrals for your own facility.",
        )

    referrals = (
        db.query(Referral)
        .filter(Referral.facility_id == facility_id)
        .order_by(Referral.created_at.desc())
        .all()
    )

    return referrals


# ---------------------------------------------------------
# Update referral status
# ---------------------------------------------------------

@router.patch(
    "/{referral_id}/status",
    response_model=ReferralOut,
)
def update_referral_status(
    referral_id: str,
    payload: ReferralStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.FACILITY_STAFF,
        )
    ),
):
    referral = (
        db.query(Referral)
        .filter(Referral.id == referral_id)
        .first()
    )

    if not referral:
        raise HTTPException(
            status_code=404,
            detail="Referral not found.",
        )

    if (
        current_user.role == UserRole.FACILITY_STAFF
        and current_user.facility_id != referral.facility_id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only update referrals for your own facility.",
        )

    referral.status = payload.status

    db.commit()
    db.refresh(referral)

    return referral