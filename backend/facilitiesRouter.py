from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Facility, User, UserRole
from schemas import FacilityCreate, FacilityOut
from auth import get_current_user, require_roles
from geo import point_wkt

router = APIRouter(prefix="/facilities", tags=["Facilities"])


@router.post("", response_model=FacilityOut, status_code=201)
def create_facility(
    payload: FacilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    """Admin-only: register a new PHC / CHC / district hospital / sub-centre."""
    facility = Facility(
        name=payload.name,
        facility_type=payload.facility_type,
        address=payload.address,
        location=point_wkt(payload.latitude, payload.longitude),
        phone_number=payload.phone_number,
    )
    db.add(facility)
    db.commit()
    db.refresh(facility)

    return FacilityOut(
        id=facility.id,
        name=facility.name,
        facility_type=facility.facility_type,
        address=facility.address,
        phone_number=facility.phone_number,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )


@router.get("/nearby", response_model=List[FacilityOut])
def get_nearby_facilities(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius_km: float = Query(15, gt=0, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns facilities within `radius_km` of the given GPS point, nearest
    first. Uses PostGIS ST_DWithin (fast, index-backed) + ST_Distance for
    accurate great-circle sorting.
    """
    origin = func.ST_GeogFromText(point_wkt(latitude, longitude))
    radius_m = radius_km * 1000

    results = (
        db.query(
            Facility,
            func.ST_Distance(Facility.location, origin).label("distance_m"),
            func.ST_Y(func.ST_GeomFromEWKB(Facility.location)).label("lat"),
            func.ST_X(func.ST_GeomFromEWKB(Facility.location)).label("lon"),
        )
        .filter(Facility.is_active.is_(True))
        .filter(func.ST_DWithin(Facility.location, origin, radius_m))
        .order_by("distance_m")
        .all()
    )

    output = []
    for facility, distance_m, lat, lon in results:
        output.append(
            FacilityOut(
                id=facility.id,
                name=facility.name,
                facility_type=facility.facility_type,
                address=facility.address,
                phone_number=facility.phone_number,
                latitude=lat,
                longitude=lon,
                distance_km=round(distance_m / 1000, 2),
            )
        )
    return output


@router.get("/{facility_id}", response_model=FacilityOut)
def get_facility(
    facility_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    facility = db.query(
        Facility,
        func.ST_Y(func.ST_GeomFromEWKB(Facility.location)).label("lat"),
        func.ST_X(func.ST_GeomFromEWKB(Facility.location)).label("lon"),
    ).filter(Facility.id == facility_id).first()

    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found.")

    fac, lat, lon = facility
    return FacilityOut(
        id=fac.id,
        name=fac.name,
        facility_type=fac.facility_type,
        address=fac.address,
        phone_number=fac.phone_number,
        latitude=lat,
        longitude=lon,
    )