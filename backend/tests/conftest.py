import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from app import database
from app.main import app


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "pesebrera3l_test.db"
    backup_dir = tmp_path / "backups"
    monkeypatch.setattr(database, "DEFAULT_DB_PATH", db_path)
    monkeypatch.setattr(database, "DEFAULT_BACKUP_DIR", backup_dir)
    database.init_db(db_path)
    with TestClient(app) as test_client:
        yield test_client