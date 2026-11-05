from fastapi.testclient import TestClient

from app import database
from app.main import app


def test_respaldo_automatico_al_cerrar(monkeypatch, tmp_path):
    db_path = tmp_path / "pesebrera3l_test.db"
    backup_dir = tmp_path / "backups"
    monkeypatch.setattr(database, "DEFAULT_DB_PATH", db_path)
    monkeypatch.setattr(database, "DEFAULT_BACKUP_DIR", backup_dir)
    database.init_db(db_path)
    with TestClient(app):
        pass
    backups = list(backup_dir.glob("*.db"))
    assert backups, "Debio crearse un respaldo al cierre del backend."