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


def create_pesebreras(conn, nombre, capacidad, cantidad=1):
    if cantidad <= 1:
        return create_pesebrera(conn, nombre, capacidad)
    new_ids = []
    for index in range(1, cantidad + 1):
        cursor = conn.execute(
            "INSERT INTO pesebreras (nombre, capacidad, estado) VALUES (?, ?, 'disponible')",
            (f"{nombre} {index}", capacidad),
        )
        new_ids.append(cursor.lastrowid)
    conn.commit()
    return [get_pesebrera(conn, new_id) for new_id in new_ids]


def delete_pesebrera(conn, pesebrera_id):
    get_pesebrera(conn, pesebrera_id)
    conn.execute(
        "UPDATE animales SET pesebrera_id = NULL, "
        "estado = CASE WHEN estado = 'asignado' THEN 'disponible' ELSE estado END, "
        "updated_at = datetime('now') WHERE pesebrera_id = ?",
        (pesebrera_id,),
    )
    conn.execute("DELETE FROM pesebreras WHERE id = ?", (pesebrera_id,))
    conn.commit()
    return {"status": "Eliminado"}


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