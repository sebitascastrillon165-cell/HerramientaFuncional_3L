from app.core.exceptions import ResourceNotFoundError, StallFullError
from app.services import queries


def list_pesebreras(conn):
    rows = conn.execute(
        "SELECT id, nombre, capacidad, estado, created_at, updated_at FROM pesebreras ORDER BY id"
    ).fetchall()
    return [dict(row) for row in rows]


def get_pesebrera(conn, pesebrera_id):
    row = conn.execute(
        "SELECT id, nombre, capacidad, estado, created_at, updated_at FROM pesebreras WHERE id = ?",
        (pesebrera_id,),
    ).fetchone()
    if row is None:
        raise ResourceNotFoundError("La pesebrera indicada no existe.")
    return dict(row)


def create_pesebrera(conn, nombre, capacidad):
    conn.execute(
        "INSERT INTO pesebreras (nombre, capacidad, estado) VALUES (?, ?, 'disponible')",
        (nombre, capacidad),
    )
    conn.commit()
    row = conn.execute(
        "SELECT id, nombre, capacidad, estado, created_at, updated_at FROM pesebreras ORDER BY id DESC LIMIT 1"
    ).fetchone()
    return dict(row)


def update_pesebrera(conn, pesebrera_id, nombre, capacidad):
    pesebrera = get_pesebrera(conn, pesebrera_id)
    conn.execute(
        "UPDATE pesebreras SET nombre = ?, capacidad = ?, updated_at = datetime('now') WHERE id = ?",
        (nombre, capacidad, pesebrera_id),
    )
    conn.commit()
    updated = get_pesebrera(conn, pesebrera_id)
    assigned = queries.count_assigned_animals(conn, pesebrera_id)
    updated["estado"] = "llena" if assigned >= updated["capacidad"] else "disponible"
    return updated


def refresh_pesebrera_state(conn, pesebrera_id):
    pesebrera = get_pesebrera(conn, pesebrera_id)
    assigned = queries.count_assigned_animals(conn, pesebrera_id)
    estado = "llena" if assigned >= pesebrera["capacidad"] else "disponible"
    conn.execute(
        "UPDATE pesebreras SET estado = ?, updated_at = datetime('now') WHERE id = ?",
        (estado, pesebrera_id),
    )