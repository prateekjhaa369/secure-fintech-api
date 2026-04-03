"""FastAPI entrypoint (work in progress).

This file is intentionally incomplete for interview discussion.
"""

from fastapi import FastAPI, HTTPException

app = FastAPI(title="Secure Fintech User Management API", version="0.2.0-wip")


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "service": "secure-fintech-api"}


@app.get("/v1/users")
def list_users() -> dict:
    # TODO: Connect Supabase query layer with tenant-safe filters.
    return {"items": [], "note": "WIP: user listing endpoint"}


@app.post("/v1/users")
def create_user(payload: dict) -> dict:
    # TODO: Add pydantic schema validation and safe inserts.
    if not payload:
        raise HTTPException(status_code=400, detail="Payload required")
    return {"result": "accepted", "note": "WIP: create flow"}


@app.post("/v1/auth/login")
def login(payload: dict) -> dict:
    # TODO: Implement JWT issue/refresh flow.
    if not payload:
        raise HTTPException(status_code=400, detail="Credentials required")
    return {"access_token": "demo-token", "token_type": "bearer", "note": "WIP"}
