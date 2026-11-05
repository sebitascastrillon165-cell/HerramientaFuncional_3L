from app.services import queries, riders_service, stables_service


def get_dashboard(conn):
    pesebreras = stables_service.list_pesebreras(conn)
    total_pesebreras = len(pesebreras)
    disponibles_pesebreras = sum(1 for item in pesebreras if item["estado"] == "disponible")
    llenas_pesebreras = sum(1 for item in pesebreras if item["estado"] == "llena")

    montadores = riders_service.list_montadores(conn)
    total_montadores = len(montadores)
    disponibles_montadores = sum(1 for item in montadores if item["disponible"] == 1 and item["carga_total"] == 0)
    activos_montadores = sum(1 for item in montadores if item["carga_total"] > 0)

    animales_rows = conn.execute(
        "SELECT tipo, COUNT(*) AS total FROM animales GROUP BY tipo"
    ).fetchall()
    caballos = 0
    mulas = 0
    for row in animales_rows:
        if row["tipo"] == "caballo":
            caballos = int(row["total"])
        elif row["tipo"] == "mula":
            mulas = int(row["total"])

    animales_por_pesebrera = []
    for item in pesebreras:
        animales_por_pesebrera.append(
            {
                "pesebrera_id": item["id"],
                "nombre": item["nombre"],
                "capacidad": item["capacidad"],
                "estado": item["estado"],
                "animales": queries.count_assigned_animals(conn, item["id"]),
            }
        )

    return {
        "total_pesebreras": total_pesebreras,
        "disponibles_pesebreras": disponibles_pesebreras,
        "llenas_pesebreras": llenas_pesebreras,
        "total_montadores": total_montadores,
        "montadores_disponibles": disponibles_montadores,
        "montadores_activos": activos_montadores,
        "total_animales": caballos + mulas,
        "caballos": caballos,
        "mulas": mulas,
        "animales_por_pesebrera": animales_por_pesebrera,
    }

