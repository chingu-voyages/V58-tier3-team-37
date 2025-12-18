"""FastAPI service exposing read-only, parameterized access to Chingu member data in BigQuery.

Error handling:
- 400 for invalid date usage
- 502 for BigQuery errors
- 500 for unexpected exceptions
"""
from fastapi import FastAPI
from app.api.routes import health, chingu_members

app = FastAPI(title="Chingu Member Demographics", version="0.2.0")


app.include_router(health.router)
app.include_router(chingu_members.router)
