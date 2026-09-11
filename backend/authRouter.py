from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db
from models import User, UserRole
from schemas import UserRegister, Token, UserOut
from auth import hash_password, verify_password, create_access_token,get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone_number == payload.phone_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered.")

    if payload.role == UserRole.FACILITY_STAFF and not payload.facility_id:
        raise HTTPException(
            status_code=400, detail="facility_id is required for facility_staff accounts."
        )
    user = User(
        phone_number=payload.phone_number,
        name=payload.name,
        password_hash=hash_password(payload.password),
        role=payload.role,
        facility_id=payload.facility_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm uses "username" as the field name; we treat
    # that as the phone number so /docs' built-in login form works too.
    user = db.query(User).filter(User.phone_number == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password.",
        )


    access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return Token(access_token=access_token, role=user.role, name=user.name)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns the profile of the currently authenticated user."""
    return current_user