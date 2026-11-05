from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
import os
import sqlite3
import sys


def _data_root():
    env_dir = os.environ.get("PESEBRERA3L_DATA")
    if env_dir:
        return Path(env_dir)
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent / "data"
    return Path(__file__).resolve().parents[2] / "data"


def _backup_root():
    env_dir = os.environ.get("PESEBRERA3L_BACKUP")
    if env_dir:
        return Path(env_dir)
    data_root = _data_root()
    return data_root / "backups"


DEFAULT_DB_PATH = _data_root() / "pesebrera3l.db"
DEFAULT_BACKUP_DIR = _backup_root()

SCHEMA = """
CREATE TABLE IF NOT EXISTS tarifas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    precio REAL NOT NULL CHECK (precio >= 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pesebreras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    capacidad INTEGER NOT NULL CHECK (capacidad > 0),
    estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'llena')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS montadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    telefono TEXT,
    disponible INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS animales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL CHECK (tipo IN ('caballo', 'mula')),
    nombre TEXT NOT NULL,
    raza TEXT,
    sexo TEXT NOT NULL DEFAULT 'macho' CHECK (sexo IN ('macho', 'hembra')),
    pesebrera_id INTEGER,
    montador_id INTEGER,
    estado TEXT NOT NULL DEFAULT 'asignado' CHECK (estado IN ('asignado', 'disponible', 'enfermo')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (pesebrera_id) REFERENCES pesebreras(id) ON DELETE SET NULL,
    FOREIGN KEY (montador_id) REFERENCES montadores(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_animales_pesebrera ON animales(pesebrera_id);
CREATE INDEX IF NOT EXISTS idx_animales_montador ON animales(montador_id);
"""


def get_connection(db_path=None):
    path = Path(db_path) if db_path is not None else DEFAULT_DB_PATH
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def db_session(db_path=None):
    conn = get_connection(db_path)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db(db_path=None):
    path = Path(db_path) if db_path is not None else DEFAULT_DB_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    with db_session(path) as conn:
        conn.executescript(SCHEMA)


def backup_database(db_path=None, backup_dir=None):
    src = Path(db_path) if db_path is not None else DEFAULT_DB_PATH
    target_dir = Path(backup_dir) if backup_dir is not None else DEFAULT_BACKUP_DIR
    target_dir.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    target_path = target_dir / ("pesebrera3l_" + timestamp + ".db")
    src_conn = get_connection(src)
    dst_conn = sqlite3.connect(str(target_path))
    src_conn.backup(dst_conn)
    dst_conn.close()
    src_conn.close()
    return target_path