import math


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Great-circle distance in kilometers between two lat/lon points.

    The primary backend distance queries use PostGIS's ST_Distance on a
    geography column (which already does an accurate great-circle
    calculation), but this pure-Python version is kept for:
      - unit tests that don't need a live DB
      - parity with the on-device Haversine calc used by the offline
        Expo/React Native app when it has a cached facility list and no signal
    """
    R = 6371.0  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(d_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def point_wkt(latitude: float, longitude: float) -> str:
    """PostGIS expects POINT(lon lat) — note the order is lon, lat."""
    return f"POINT({longitude} {latitude})"