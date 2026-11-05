from app.core.exceptions import ResourceNotFoundError
from app.services import queries


def get_montador(conn, montador_id):
    row = conn.execute(
        "SELECT id, nombre, telefono, disponible, created_at, updated_at FROM montadores WHERE id = ?",
        (montador_id,),
    ).fetchone()
    if row is None:
        raise ResourceNotFoundError("El montador indicado no existe.")
    return dict(row)


def list_montadores(conn):
    rows = conn.execute(
        "SELECT id, nombre, telefono, disponible, created_at, updated_at FROM montadores ORDER BY id"
    ).fetchall()
    result = []
    for row in rows:
        item = dict(row)
        load = queries.rider_load_by_type(conn, item["id"])
        item["caballos"] = load.get("caballo", 0)
        item["mulas"] = load.get("mula", 0)
        item["carga_total"] = item["caballos"] + item["mulas"]
        result.append(item)
    return result


def create_montador(conn, payload):
    disponible = 1 if payload.get("disponible", True) else 0
    conn.execute(
        "INSERT INTO montadores (nombre, telefono, disponible) VALUES (?, ?, ?)",
        (payload.get("nombre"), payload.get("telefono"), disponible),
    )
    conn.commit()
    row = conn.execute(
        "SELECT id, nombre, telefono, disponible, created_at, updated_at FROM montadores ORDER BY id DESC LIMIT 1"
    ).fetchone()
    return dict(row)


def update_montador(conn, montador_id, payload):
    montador = get_montador(conn, montador_id)
    disponible = montador["disponible"]
    if payload.get("disponible") is not None:
        disponible = 1 if payload.get("disponible") else 0
    conn.execute(
        "UPDATE montadores SET nombre = ?, telefono = ?, disponible = ?, updated_at = datetime('now') WHERE id = ?",
        (payload.get("nombre") or montador["nombre"], payload.get("telefono") or montador["telefono"], disponible, montador_id),
    )
    conn.commit()
    return get_montador(conn, montador_id)