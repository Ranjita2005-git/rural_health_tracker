import datetime
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import User, UserRole


# Token URL points to the login endpoint so Swagger /docs works.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    bcrypt has a maximum password length of 72 bytes.
    """
    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        raise ValueError("Password cannot be longer than 72 bytes.")

    hashed = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    )

    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a bcrypt hash.
    """
    password_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")

    if len(password_bytes) > 72:
        return False

    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(
    data: dict,
    expires_delta: Optional[datetime.timedelta] = None
) -> str:
    to_encode = data.copy()

    expire = datetime.datetime.utcnow() + (
        expires_delta
        or datetime.timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )

        user_id: str = payload.get("sub")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()

    if user is None or not user.is_active:
        raise credentials_exception

    return user


def require_roles(*allowed_roles: UserRole):
    """
    Dependency factory for role-based access control.

    Example:
    Depends(
        require_roles(
            UserRole.FACILITY_STAFF,
            UserRole.ADMIN
        )
    )
    """

    def role_checker(
        current_user: User = Depends(get_current_user)
    ) -> User:

        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Role '{current_user.role.value}' "
                    "is not permitted to perform this action."
                ),
            )

        return current_user

    return role_checker

def get_optional_current_user(
    token: str | None = Depends(
        OAuth2PasswordBearer(
            tokenUrl="auth/login",
            auto_error=False,
        )
    ),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Returns the logged-in user when a valid JWT is supplied.
    Returns None when the request has no token.

    Used for endpoints that can work for both:
    authenticated users (ASHA) and
    unauthenticated users (Villagers).
    """

    if not token:
        return None

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )

        user_id: str = payload.get("sub")

        if not user_id:
            return None

    except JWTError:
        return None

    user = db.query(User).filter(User.id == user_id).first()

    if user is None or not user.is_active:
        return None

    return user