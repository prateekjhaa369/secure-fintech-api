"""JWT and request-security helpers (work in progress)."""

from datetime import datetime, timedelta, timezone


def create_access_token(subject: str, expiry_minutes: int = 30) -> dict:
    """Return a token payload preview.

    TODO: Replace with signed JWT using python-jose or PyJWT.
    """
    now = datetime.now(timezone.utc)
    return {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=expiry_minutes)).timestamp()),
        "scope": "user:read user:write",
    }


def verify_token(token: str) -> bool:
    """Token verification placeholder.

    TODO: Validate signature, issuer, audience, and revocation list.
    """
    return bool(token)
