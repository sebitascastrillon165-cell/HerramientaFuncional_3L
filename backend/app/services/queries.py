def count_assigned_animals(conn, pesebrera_id):
    row = conn.execute(
        "SELECT COUNT(*) AS total FROM animales WHERE pesebrera_id = ? AND estado = 'asignado'",
        (pesebrera_id,),
    ).fetchone()
    return int(row["total"])


def rider_load_by_type(conn, montador_id):
    rows = conn.execute(
        "SELECT tipo, COUNT(*) AS total FROM animales "
        "WHERE montador_id = ? AND estado = 'asignado' GROUP BY tipo",
        (montador_id,),
    ).fetchall()
    return {row["tipo"]: int(row["total"]) for row in rows}
