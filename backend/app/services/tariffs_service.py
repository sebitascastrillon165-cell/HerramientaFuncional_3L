from app.services import queries


def list_tarifas(conn):
    rows = conn.execute(
        "SELECT id, nombre, precio, created_at, updated_at FROM tarifas ORDER BY id"
    ).fetchall()
    return [dict(row) for row in rows]


def create_tarifa(conn, nombre, precio):
    conn.execute(
        "INSERT INTO tarifas (nombre, precio) VALUES (?, ?)",
        (nombre, precio),
    )
    conn.commit()
    row = conn.execute(
        "SELECT id, nombre, precio, created_at, updated_at FROM tarifas ORDER BY id DESC LIMIT 1"
    ).fetchone()
    return dict(row)


def update_tarifa(conn, tarifa_id, nombre, precio):
    conn.execute(
        "UPDATE tarifas SET nombre = ?, precio = ?, updated_at = datetime('now') WHERE id = ?",
        (nombre, precio, tarifa_id),
    )
    conn.commit()
    row = conn.execute(
        "SELECT id, nombre, precio, created_at, updated_at FROM tarifas WHERE id = ?",
        (tarifa_id,),
    ).fetchone()
    return dict(row)