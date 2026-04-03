# Secure Fintech User Management API

Status: Active Development (Demo + Backend WIP)

## Live Demo (Current)
- Interactive browser app for access-request management.
- Add/Edit/Delete records, search, filter, sort, and export JSON.
- Uses free public API data for demo seeding and localStorage for persistence.

## Backend Work In Progress
- FastAPI skeleton with draft endpoints: `backend_fastapi/app/main.py`
- JWT helper draft: `backend_fastapi/app/security.py`
- RLS policy draft: `backend_fastapi/sql/rls_policies.sql`
- OpenAPI draft contract: `openapi/secure-fintech-openapi.yaml`
- Progress notes: `docs/current-work.md`

## Target Stack
- Backend: FastAPI, Python
- Database: Supabase (PostgreSQL)
- Security: JWT, Row-Level Security (RLS), middleware authorization

## Interview Metrics Narrative
- Designed for 5k+ sensitive profile records in a multi-tenant model.
- Focused on tenant isolation, strict state integrity, and secure auth controls.
- Current demo validates product flow while backend security layers are being integrated.
