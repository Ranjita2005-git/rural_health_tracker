from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from referralsRouter import router as referrals_router
from database import Base, engine
import authRouter, facilitiesRouter, doctorsRouter, availabilityRouter,chatRouter

# Creates tables if they don't exist yet. For production, prefer Alembic
# migrations instead (see README) so schema changes are versioned.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Rural Health Navigator API",
    description=(
        "Backend for the Rural Health Navigator app — facility lookup, "
        "and real-time doctor availability for ASHA workers and villagers."
    ),
    version="1.0.0",
)

# In production, restrict this to the actual mobile app / dashboard origins.
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8443",
        "http://127.0.0.1:8443"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authRouter.router)
app.include_router(facilitiesRouter.router)
app.include_router(doctorsRouter.router)
app.include_router(availabilityRouter.router)
app.include_router(chatRouter.router)
app.include_router(referrals_router)

@app.get("/", tags=["Health Check"])
def root():
    return {"status": "ok", "service": "Rural Health Navigator API"}