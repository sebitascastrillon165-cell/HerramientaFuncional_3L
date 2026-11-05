from fastapi import APIRouter
from app.database import db_session
from app.services import dashboard_service

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


@router.get("/")
def obtener_dashboard():
    with db_session() as conn:
        return dashboard_service.get_dashboard(conn)